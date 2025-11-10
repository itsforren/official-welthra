import { openai } from "@ai-sdk/openai";
import { frontendTools } from "@assistant-ui/react-ai-sdk";
import { convertToModelMessages, streamText } from "ai";
import { PROMPT_CONFIG } from "./config";

export const maxDuration = 30;

// System prompt from your OpenAI Responses API configuration
// You can customize this or fetch it dynamically from your prompt management system
const SYSTEM_PROMPT = `You are a helpful AI assistant. Follow the instructions from prompt ID: ${PROMPT_CONFIG.id} version ${PROMPT_CONFIG.version}`;

export async function POST(req: Request) {
  const { messages, system, tools } = await req.json();

  // Use the system prompt from the configuration or fall back to the one from the request
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
}
