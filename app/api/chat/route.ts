// app/api/chat/route.ts

// 1. Import the openai provider AND the *experimental* fileSearchTool
//    This is the key fix.
import { openai, experimental_fileSearchTool } from '@ai-sdk/openai';

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
    
    // 7. Pass the Prompt ID *as the model*
    model: openai(process.env.OPENAI_PROMPT_ID!),

    // 8. THIS IS THE FIX:
    //    Use the *experimental* tool import
    tools: {
      fileSearch: experimental_fileSearchTool()
    },

    // 9. Pass the *converted* message history
    messages: modelMessages,
  });

  // 10. Stream the response back to assistant-ui
  return result.toAIStreamResponse();
}
