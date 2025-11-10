// app/api/chat/route.ts

// 1. Import the *correct* function for Assistants/Prompts
import { streamAssistant } from 'ai/openai';

// 2. Set the runtime to 'edge' for speed
export const runtime = 'edge';

export async function POST(req: Request) {
  // 3. Get the message and threadId from the assistant-ui frontend
  const { threadId, message } = await req.json();

  // 4. Call the streamAssistant function
  const result = await streamAssistant({

    // 5. THIS IS THE FIX:
    //    Use the 'assistantId' parameter for your Prompt ID.
    //    The Vercel AI SDK knows that 'pmpt_...' is a Prompt.
    assistantId: process.env.OPENAI_PROMPT_ID!,

    // 6. Pass the threadId (if it exists)
    //    The SDK will create a new thread if it's null
    threadId,

    // 7. Pass the new user message
    message,
  });

  // 8. Stream the assistant's response (which assistant-ui expects)
  return result.toAIStreamResponse();
}
