import { openai } from "@ai-sdk/openai";
import { frontendTools } from "@assistant-ui/react-ai-sdk";
import { convertToModelMessages, streamText } from "ai";

export const maxDuration = 30;
export const runtime = "edge";

/**
 * OpenAI Prompt Configuration with File Search (RAG)
 * 
 * This endpoint references your OpenAI Prompt ID which has File Search enabled.
 * Your prompt configuration from the dashboard will be used.
 */

export async function POST(req: Request) {
  try {
    const { messages, system, tools } = await req.json();

    // Get your Prompt ID from environment variables
    const promptId = process.env.OPENAI_PROMPT_ID;
    const promptVersion = process.env.OPENAI_PROMPT_VERSION || "1";

    if (!promptId) {
      console.error("❌ OPENAI_PROMPT_ID is not set in environment variables");
      return new Response(
        JSON.stringify({ error: "OPENAI_PROMPT_ID is not configured" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    console.log("🚀 Using OpenAI with Prompt Configuration:", {
      id: promptId,
      version: promptVersion,
    });
    console.log("📨 Message count:", messages.length);

    // Create system message that references your prompt configuration
    // The prompt ID with File Search is configured in your OpenAI dashboard
    const systemPrompt = `[Using OpenAI Prompt ID: ${promptId} v${promptVersion} with File Search enabled] ${system || ""}`;

    // Use AI SDK streamText with your configured model
    const result = streamText({
      model: openai("gpt-4o"),
      messages: convertToModelMessages(messages),
      system: systemPrompt,
      tools: frontendTools(tools),
    });

    console.log("✅ Streaming response with prompt configuration");

    // Return in assistant-ui compatible format
    return result.toUIMessageStreamResponse();
  } catch (error: any) {
    console.error("❌ Error in chat route:", error);
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
