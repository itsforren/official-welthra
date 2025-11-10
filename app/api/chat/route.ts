import { PROMPT_CONFIG } from "./config";
import { streamText } from "ai";

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    console.log("🚀 Calling OpenAI Responses API with Prompt:", PROMPT_CONFIG);
    
    // Get the latest user message
    const latestMessage = messages[messages.length - 1];
    const userInput = typeof latestMessage?.content === "string" 
      ? latestMessage.content 
      : latestMessage?.content?.[0]?.text || "";
    
    console.log("📨 User input:", userInput);

    // Call the ACTUAL OpenAI Responses API endpoint
    const responsesAPIUrl = "https://api.openai.com/v1/responses";
    
    const response = await fetch(responsesAPIUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        prompt: {
          id: PROMPT_CONFIG.id,
          version: PROMPT_CONFIG.version,
        },
        input: userInput,
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Responses API error:", response.status, errorText);
      throw new Error(`Responses API error: ${response.status} - ${errorText}`);
    }

    console.log("✅ Responses API connected, streaming response...");

    // Stream the response back
    return new Response(response.body, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
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
