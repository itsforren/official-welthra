import { openai } from "@ai-sdk/openai";
import { frontendTools } from "@assistant-ui/react-ai-sdk";
import { convertToModelMessages, streamText } from "ai";
import { PROMPT_CONFIG } from "./config";

export const maxDuration = 30;

// NOTE: OpenAI Responses API with prompt.id is being used via system message
// To use the actual Responses API endpoint, you would need direct API access
// For now, we reference your prompt configuration in the system message
const SYSTEM_PROMPT = `You are an AI assistant. Use the instructions and behavior defined in OpenAI prompt ID: ${PROMPT_CONFIG.id}, version: ${PROMPT_CONFIG.version}`;

export async function POST(req: Request) {
  try {
    const { messages, system, tools } = await req.json();

    console.log("Processing chat request with prompt config:", PROMPT_CONFIG);
    console.log("Latest message:", messages[messages.length - 1]);

    // Use the configured prompt as system message
    const effectiveSystem = system || SYSTEM_PROMPT;

    const result = streamText({
      model: openai("gpt-4o"),
      messages: convertToModelMessages(messages),
      system: effectiveSystem,
      tools: {
        ...frontendTools(tools),
        // add backend tools here
      },
    });

    return result.toUIMessageStreamResponse();
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
