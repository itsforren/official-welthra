import { openai } from "@ai-sdk/openai";
import { frontendTools } from "@assistant-ui/react-ai-sdk";
import { convertToModelMessages, streamText } from "ai";
import { PROMPT_CONFIG } from "./config";

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages, system, tools } = await req.json();

    console.log("🚀 Using Prompt Config:", PROMPT_CONFIG);
    console.log("📨 Latest message:", messages[messages.length - 1]);

    // Create system message with prompt reference
    const systemMessage = `You are using OpenAI prompt ID: ${PROMPT_CONFIG.id}, version: ${PROMPT_CONFIG.version}. ${system || ""}`;

    // Use AI SDK's streamText with OpenAI
    const result = streamText({
      model: openai("gpt-4o"),
      messages: convertToModelMessages(messages),
      system: systemMessage,
      tools: {
        ...frontendTools(tools),
        // Add backend tools here if needed
      },
    });

    // Return in the format assistant-ui expects
    return result.toUIMessageStreamResponse();
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
