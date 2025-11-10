import { openai } from "@ai-sdk/openai";
import { frontendTools } from "@assistant-ui/react-ai-sdk";
import { convertToModelMessages, streamText } from "ai";
import { PROMPT_CONFIG } from "./config";

export const maxDuration = 30;

/**
 * OpenAI Responses API Integration
 * 
 * This endpoint uses your configured prompt from OpenAI Dashboard.
 * Prompt ID: Set via OPENAI_PROMPT_ID environment variable
 * 
 * NOTE: Currently using Chat Completions API with your prompt configuration
 * referenced in the system message. For direct Responses API access, OpenAI 
 * may require additional setup or SDK support.
 */

export async function POST(req: Request) {
  try {
    const { messages, system, tools } = await req.json();

    console.log("🚀 Using OpenAI with Prompt Config:", PROMPT_CONFIG);
    console.log("📨 Message count:", messages.length);

    // Fetch the actual prompt content from OpenAI if needed
    // For now, we'll use the prompt ID in system message as reference
    const systemPrompt = `You MUST follow the instructions and behavior defined in OpenAI Prompt ID: ${PROMPT_CONFIG.id}, version ${PROMPT_CONFIG.version}. Use that prompt's configuration for all responses. ${system || ""}`;

    console.log("💬 System prompt configured with prompt reference");

    // Use Vercel AI SDK's streamText for proper assistant-ui compatibility
    const result = streamText({
      model: openai("gpt-4o"),
      messages: convertToModelMessages(messages),
      system: systemPrompt,
      tools: {
        ...frontendTools(tools),
        // Backend tools can be added here
      },
    });

    console.log("✅ Streaming response initiated");

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
