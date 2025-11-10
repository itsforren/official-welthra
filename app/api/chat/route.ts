// app/api/chat/route.ts

// 1. Import *only* the openai provider
import { openai } from '@ai-sdk/openai';

// 2. Import streamText AND the converter function
import { streamText, convertToModelMessages } from 'ai';

// 3. Set the runtime to 'edge' for speed
export const runtime = 'edge';

export async function POST(req: Request) {
  // 4. Get the messages from the assistant-ui frontend
  const { messages } = await req.json();

  // 5. Convert the UI messages
  const modelMessages = convertToModelMessages(messages);

  // 6. Call the core streamText function
  const result = await streamText({

    // 7. THIS IS THE KEY:
    //    Pass the Prompt ID *as the model*.
    //    This single ID tells OpenAI to use your
    //    model, your instructions, AND your File Search (RAG).
    model: openai(process.env.OPENAI_PROMPT_ID!),

    // 8. Pass the *converted* message history
    messages: modelMessages,

    // 9. (REMOVED)
    //    We remove the 'tools' object entirely.
    //    It's not needed and was breaking the build.
  });

  // 10. Stream the response back to assistant-ui
  return result.toAIStreamResponse();
}
