import OpenAI from "openai";
import { AssistantResponse } from "ai";
import { PROMPT_CONFIG } from "./config";

export const maxDuration = 30;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  const { messages } = await req.json();

  // Get the latest user message
  const userMessage = messages[messages.length - 1]?.content || "";

  // Create a response stream
  return AssistantResponse(
    { threadId: "thread_1" },
    async ({ sendMessage, sendDataMessage }) => {
      try {
        // Call OpenAI Responses API with your prompt ID
        const response = await openai.responses.create({
          prompt: {
            id: PROMPT_CONFIG.id,
            version: PROMPT_CONFIG.version,
          },
          // Pass the user's message as input
          input: userMessage,
          stream: true,
        });

        // Stream the response
        let fullContent = "";
        for await (const chunk of response) {
          if (chunk.choices?.[0]?.delta?.content) {
            const content = chunk.choices[0].delta.content;
            fullContent += content;
          }
        }

        // Send the complete message
        sendMessage({
          role: "assistant",
          content: [{ type: "text", text: fullContent }],
        });
      } catch (error) {
        console.error("Error calling OpenAI Responses API:", error);
        sendMessage({
          role: "assistant",
          content: [
            {
              type: "text",
              text: "Sorry, I encountered an error. Please try again.",
            },
          ],
        });
      }
    }
  );
}
