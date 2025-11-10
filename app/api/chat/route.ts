import { createUIMessageStreamResponse } from "ai";

export const runtime = "edge";
export const maxDuration = 30;

/**
 * OpenAI Responses API bridge for assistant-ui.
 *
 * This route calls the Responses API with your Prompt ID (including File Search)
 * and adapts the streaming payload to the assistant-ui UI Message Stream format.
 */

type AssistantUIMessages = Array<{
  role: string;
  content?: string | Array<{ text?: string }>;
  parts?: Array<{ type?: string; text?: string }>;
}>;

type ResponsesInputItem = {
  role: "user" | "assistant" | "system";
  content: string;
};

function extractTextFromMessage(message: AssistantUIMessages[number]): string {
  if (typeof message.content === "string") {
    return message.content;
  }

  if (Array.isArray(message.content)) {
    return message.content
      .map((part) => {
        if (typeof part === "string") return part;
        return part?.text ?? "";
      })
      .join("");
  }

  if (Array.isArray(message.parts)) {
    return message.parts
      .map((part) => (part?.type === "text" ? part.text ?? "" : ""))
      .join("");
  }

  return "";
}

function convertMessagesToResponsesInput(messages: AssistantUIMessages): ResponsesInputItem[] {
  const allowedRoles = new Set(["user", "assistant", "system"]);

  return messages
    .filter((message) => allowedRoles.has(message.role))
    .map((message) => ({
      role: message.role as ResponsesInputItem["role"],
      content: extractTextFromMessage(message),
    }))
    .filter((item) => item.content.trim().length > 0);
}

function createAssistantUIMessageStream(openAIStream: ReadableStream<Uint8Array>) {
  const decoder = new TextDecoder();
  const messageId =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `response-${Date.now()}`;

  let controllerRef: ReadableStreamDefaultController<any> | null = null;
  let reader: ReadableStreamDefaultReader<Uint8Array> | null = null;
  let started = false;
  let finished = false;

  const sendStart = () => {
    if (!started) {
      started = true;
      controllerRef?.enqueue({
        type: "text-start",
        id: messageId,
      });
    }
  };

  const sendEnd = () => {
    if (!finished) {
      finished = true;
      if (started) {
        controllerRef?.enqueue({
          type: "text-end",
          id: messageId,
        });
      }
      controllerRef?.close();
    }
  };

  const sendError = (errorText: string) => {
    if (finished) return;
    controllerRef?.enqueue({
      type: "error",
      errorText,
    });
    finished = true;
    controllerRef?.close();
  };

  return new ReadableStream({
    async start(controller) {
      controllerRef = controller;
      reader = openAIStream.getReader();
      let buffer = "";

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            sendEnd();
            break;
          }

          buffer += decoder.decode(value, { stream: true });

          let separatorIndex: number;
          while ((separatorIndex = buffer.indexOf("\n\n")) !== -1) {
            const rawEvent = buffer.slice(0, separatorIndex);
            buffer = buffer.slice(separatorIndex + 2);

            const dataLines = rawEvent
              .split("\n")
              .filter((line) => line.trim().startsWith("data:"));

            if (dataLines.length === 0) {
              continue;
            }

            const payloadStr = dataLines
              .map((line) => line.slice(line.indexOf("data:") + 5).trim())
              .join("");

            if (!payloadStr) {
              continue;
            }

            if (payloadStr === "[DONE]") {
              sendEnd();
              return;
            }

            let payload: any;
            try {
              payload = JSON.parse(payloadStr);
            } catch (error) {
              console.error("⚠️ Failed to parse Responses API event:", payloadStr, error);
              continue;
            }

            const eventType = payload?.type;

            switch (eventType) {
              case "response.output_text.delta": {
                const delta =
                  payload?.delta ??
                  payload?.response?.output_text_delta ??
                  payload?.response?.output_text ??
                  "";

                if (typeof delta === "string" && delta.length > 0) {
                  sendStart();
                  controller.enqueue({
                    type: "text-delta",
                    id: messageId,
                    delta,
                  });
                }
                break;
              }

              case "response.completed":
              case "response.output_text.done": {
                sendEnd();
                return;
              }

              case "response.refusal.delta": {
                // Optional: surface refusal text
                const delta = payload?.delta ?? "";
                if (typeof delta === "string" && delta.length > 0) {
                  sendStart();
                  controller.enqueue({
                    type: "text-delta",
                    id: messageId,
                    delta,
                  });
                }
                break;
              }

              case "response.error":
              case "error": {
                const errorText =
                  payload?.error?.message ??
                  payload?.message ??
                  "Unknown error from Responses API";
                sendError(errorText);
                return;
              }

              default:
                // Ignore other event types (tool calls, reasoning, etc.) for now.
                break;
            }
          }
        }
      } catch (error: any) {
        console.error("❌ Error while streaming Responses API payload:", error);
        sendError(error?.message ?? "Failed to stream response");
      }
    },
    cancel() {
      try {
        reader?.cancel();
      } catch {
        // ignore cancellation errors
      }
      sendEnd();
    },
  });
}

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const apiKey = process.env.OPENAI_API_KEY;
    const promptId = process.env.OPENAI_PROMPT_ID;
    const promptVersion = process.env.OPENAI_PROMPT_VERSION || "1";

    if (!apiKey || !promptId) {
      console.error("❌ Missing environment variables");
      return new Response(
        JSON.stringify({ error: "OPENAI_API_KEY and OPENAI_PROMPT_ID required" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const input = convertMessagesToResponsesInput(messages ?? []);

    console.log("🚀 OpenAI Responses API");
    console.log("📋 Prompt:", { id: promptId, version: promptVersion });
    console.log("📨 Message count:", input.length);

    const responsesAPI = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        prompt: {
          id: promptId,
          version: promptVersion,
        },
        input,
        stream: true,
      }),
    });

    if (!responsesAPI.ok || !responsesAPI.body) {
      const error = await responsesAPI.text();
      console.error("❌ API Error:", responsesAPI.status, error);
      throw new Error(`Responses API error: ${responsesAPI.status}`);
    }

    console.log("✅ Streaming with File Search enabled");

    const uiStream = createAssistantUIMessageStream(responsesAPI.body);

    return createUIMessageStreamResponse({
      stream: uiStream,
    });
  } catch (error: any) {
    console.error("❌ Error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
