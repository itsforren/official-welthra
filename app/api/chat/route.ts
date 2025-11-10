import { PROMPT_CONFIG } from "./config";

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    // Get the latest user message
    const userMessage =
      typeof messages[messages.length - 1]?.content === "string"
        ? messages[messages.length - 1]?.content
        : messages[messages.length - 1]?.content?.[0]?.text || "";

    console.log("Calling OpenAI Responses API with input:", userMessage);
    console.log("Using prompt:", PROMPT_CONFIG);

    // Call OpenAI Responses API
    // Endpoint: POST https://api.openai.com/v1/responses
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        prompt: {
          id: PROMPT_CONFIG.id,
          version: PROMPT_CONFIG.version,
        },
        input: userMessage,
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI Responses API error:", response.status, errorText);
      throw new Error(
        `OpenAI Responses API error: ${response.status} - ${errorText}`
      );
    }

    // Return the streaming response directly
    return new Response(response.body, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error: any) {
    console.error("Error in chat route:", error);
    return new Response(
      JSON.stringify({
        error: error.message || "Internal server error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
