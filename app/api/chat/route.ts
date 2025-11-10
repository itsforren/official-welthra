import OpenAI from "openai";
import { PROMPT_CONFIG } from "./config";

export const maxDuration = 30;
export const runtime = "edge";

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    console.log("🚀 Using OpenAI Responses API with Prompt:", PROMPT_CONFIG);

    // Initialize OpenAI client with API key
    const openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY!,
    });

    // Get the latest user message
    const latestMessage = messages[messages.length - 1];
    const userInput =
      typeof latestMessage?.content === "string"
        ? latestMessage.content
        : latestMessage?.content?.[0]?.text || "";

    console.log("📨 User input:", userInput);

    // Call OpenAI API with prompt configuration
    const response = await openaiClient.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `Use prompt: ${PROMPT_CONFIG.id} version ${PROMPT_CONFIG.version}`,
        },
        ...messages.map((msg: any) => ({
          role: msg.role,
          content:
            typeof msg.content === "string"
              ? msg.content
              : msg.content?.[0]?.text || "",
        })),
      ],
      stream: true,
    });

    // Create a streaming response compatible with assistant-ui
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const messageId = `msg_${Date.now()}`;
          let fullContent = "";

          for await (const chunk of response) {
            const content = chunk.choices[0]?.delta?.content || "";
            if (content) {
              fullContent += content;

              // Send in assistant-ui format
              const data = {
                type: "text-delta",
                textDelta: content,
              };

              controller.enqueue(
                encoder.encode(`0:${JSON.stringify(data)}\n`)
              );
            }
          }

          // Send finish message
          controller.enqueue(
            encoder.encode(
              `0:${JSON.stringify({
                type: "finish",
                finishReason: "stop",
              })}\n`
            )
          );

          controller.close();
        } catch (error) {
          console.error("❌ Streaming error:", error);
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "X-Vercel-AI-Data-Stream": "v1",
      },
    });
  } catch (error: any) {
    console.error("❌ Error in chat route:", error);
    return new Response(
      JSON.stringify({
        error: error.message || "Internal server error",
        details: error.toString(),
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
