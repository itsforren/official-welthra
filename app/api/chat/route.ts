// app/api/chat/route.ts

// 1. Import the correct Vercel AI SDK provider for OpenAI
//    Make sure you have run: npm install @ai-sdk/openai
import { openai } from '@ai-sdk/openai';

// 2. Import streamText AND the converter function
import { streamText, convertToModelMessages } from 'ai';

// 3. Set the runtime to 'edge' for speed
export const runtime = 'edge';

export async function POST(req: Request) {
  // 4. Get the messages from the assistant-ui frontend
  const { messages } = await req.json();

  // 5. THIS IS THE FIX: Convert the UI messages
  const modelMessages = convertToModelMessages(messages);

  // 6. Call the core streamText function
  const result = await streamText({

    // 7. THIS IS THE CRITICAL LINE:
    //    You must WRAP the Prompt ID in the `openai()` provider.
    //    This tells the SDK *how* to call the Responses API.
    model: openai(process.env.OPENAI_PROMPT_ID!),

    // 8. Explicitly enable the File Search (RAG) tool
    tools: {
      file_search: {}
    },

    // 9. Pass the *converted* message history
    messages: modelMessages,
  });

  // 10. Stream the response back to assistant-ui
  return result.toAIStreamResponse();
}
