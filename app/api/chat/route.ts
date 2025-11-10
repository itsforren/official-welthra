// 1. Import the correct Vercel AI SDK provider for OpenAI
import { openai } from '@ai-sdk/openai';

// 2. Import the core streamText function
import { streamText } from 'ai';

// 3. Set the runtime to 'edge' for speed
export const runtime = 'edge';

export const maxDuration = 30;

/**
 * OpenAI Responses API with Prompt ID and File Search (RAG)
 * 
 * This endpoint uses your Prompt ID from the OpenAI dashboard.
 * The Prompt ID is passed AS THE MODEL parameter, which tells the SDK
 * to use the Responses API with your configured prompt and File Search.
 */

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    // Get your Prompt ID from environment variables
    const promptId = process.env.OPENAI_PROMPT_ID;

    if (!promptId) {
      console.error("❌ OPENAI_PROMPT_ID is not set in environment variables");
      return new Response(
        JSON.stringify({ error: "OPENAI_PROMPT_ID is not configured" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    console.log("🚀 Using OpenAI Responses API with Prompt ID:", promptId);
    console.log("📨 Message count:", messages.length);

    // 4. Call the core streamText function
    const result = await streamText({
      // 5. THIS IS THE MAGIC:
      //    Pass the Prompt ID (from .env.local) *as the model*
      //    The SDK recognizes it's a Prompt ID and calls the Responses API
      //    File Search is automatically enabled from your prompt configuration
      model: openai(promptId),

      // 7. Pass the conversation history
      messages,
    });

    console.log("✅ Streaming from Responses API with File Search enabled");

    // 8. Stream the response back to assistant-ui in the correct format
    return result.toTextStreamResponse();
  } catch (error: any) {
    console.error("❌ Error in Responses API route:", error);
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
    });
    
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
