export const runtime = 'edge';
export const maxDuration = 30;

/**
 * OpenAI Responses API Implementation
 * 
 * Based on official documentation:
 * https://platform.openai.com/docs/api-reference/responses/create
 * 
 * This calls the Responses API with your prompt ID, which enables:
 * - File Search (RAG) from your dashboard configuration
 * - All tools attached to your prompt
 * - Prompt instructions from your dashboard
 */

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

    console.log("🚀 OpenAI Responses API");
    console.log("📋 Prompt:", { id: promptId, version: promptVersion });

    // Get user input from the latest message
    const latestMessage = messages[messages.length - 1];
    const userInput = 
      typeof latestMessage?.content === "string" ? latestMessage.content :
      latestMessage?.content?.[0]?.text ||
      (latestMessage?.parts?.[0]?.type === "text" ? latestMessage.parts[0].text : "");

    console.log("💬 Input:", userInput);

    // Call OpenAI Responses API per documentation
    const responsesAPI = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        prompt: {
          id: promptId,
          version: promptVersion,
        },
        input: userInput,
        stream: true,
      }),
    });

    if (!responsesAPI.ok) {
      const error = await responsesAPI.text();
      console.error("❌ API Error:", responsesAPI.status, error);
      throw new Error(`API error: ${responsesAPI.status}`);
    }

    console.log("✅ Streaming with File Search enabled");

    return new Response(responsesAPI.body, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (error: any) {
    console.error("❌ Error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
