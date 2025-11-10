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

    // 7. THIS IS THE FIX (A):
    //    Explicitly define the model. This MUST match
    //    the model you selected inside your Prompt on the dashboard.
    model: openai('gpt-4o'), // Or 'gpt-5' etc.

    // 8. THIS IS THE FIX (B):
    //    Explicitly pass the Prompt ID in the 'prompt' field.
    prompt: {
      id: process.env.OPENAI_PROMPT_ID!
    },

    // 9. Pass the *converted* message history
    messages: modelMessages,

    // 10. (REMOVED)
    //     The 'tools' object is not needed because your Prompt ID
    //     already includes the File Search tool by default.
  });

  // 11. Stream the response back
  return result.toTextStreamResponse();
}
