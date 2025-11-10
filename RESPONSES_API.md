# OpenAI Responses API Integration

## What Changed

The assistant-ui app now uses **OpenAI's Responses API** with your specific prompt ID. This allows you to manage and version your prompts directly in OpenAI's platform.

## Current Configuration

### Prompt Details
- **Prompt ID**: `pmpt_691128564e1c8193a7ad265787d23e7808fb0688728fa766`
- **Version**: `1`
- **Configuration File**: `app/api/chat/config.ts`

## How It Works

The implementation directly calls the OpenAI Responses API:

1. **User sends a message** in the chat
2. **API extracts the latest message** from the chat history
3. **Calls OpenAI Responses API** at `https://api.openai.com/v1/responses`
4. **Sends prompt ID, version, and user input** in the request
5. **Response is streamed back** to the user in real-time

### Request Format

```typescript
POST https://api.openai.com/v1/responses

{
  "prompt": {
    "id": "pmpt_691128564e1c8193a7ad265787d23e7808fb0688728fa766",
    "version": "1"
  },
  "input": "User's message here",
  "stream": true
}
```

## Code Structure

```
app/api/chat/
├── route.ts       # Main API endpoint calling Responses API
└── config.ts      # Prompt configuration (ID and version)
```

## Benefits of Responses API

✅ **Centralized Prompt Management** - Edit prompts in OpenAI's dashboard  
✅ **Version Control** - Track and test different prompt versions  
✅ **No Code Changes** - Update prompts without redeploying  
✅ **Team Collaboration** - Share prompts across team members  
✅ **A/B Testing** - Test different versions easily  

## Updating Your Prompt

### Method 1: Edit Config File

Edit `app/api/chat/config.ts`:

```typescript
export const PROMPT_CONFIG = {
  id: "your_new_prompt_id",
  version: "2",
};
```

Then commit and push:
```bash
git add app/api/chat/config.ts
git commit -m "Update prompt configuration"
git push origin main
```

### Method 2: Use Environment Variables (Recommended for Production)

1. Update `app/api/chat/config.ts`:
```typescript
export const PROMPT_CONFIG = {
  id: process.env.OPENAI_PROMPT_ID || "pmpt_691128564e1c8193a7ad265787d23e7808fb0688728fa766",
  version: process.env.OPENAI_PROMPT_VERSION || "1",
};
```

2. Add to Vercel Environment Variables:
   - `OPENAI_PROMPT_ID` = your prompt ID
   - `OPENAI_PROMPT_VERSION` = version number

3. Redeploy in Vercel

## Managing Prompts in OpenAI Platform

1. Visit: https://platform.openai.com/prompts
2. Create or edit your prompt
3. Copy the Prompt ID (starts with `pmpt_`)
4. Note the version number
5. Update your config file or environment variables

## Testing Locally

1. Make sure `OPENAI_API_KEY` is set in `.env.local`:
   ```
   OPENAI_API_KEY=sk-...your-key-here...
   ```

2. Run the dev server:
   ```bash
   npm run dev
   ```

3. Visit: http://localhost:3000

4. Send a test message

5. Check the terminal logs for debugging:
   ```
   Calling OpenAI Responses API with input: [user message]
   Using prompt: { id: 'pmpt_...', version: '1' }
   ```

## Troubleshooting

### Error: "Prompt not found"
- ✅ Verify the prompt ID is correct (starts with `pmpt_`)
- ✅ Check that the version exists in your OpenAI dashboard
- ✅ Ensure your API key has access to the prompt

### Error: "Invalid input"
- ✅ Check your prompt accepts an `input` parameter
- ✅ Review the prompt configuration at https://platform.openai.com/prompts

### Error: "401 Unauthorized"
- ✅ Verify `OPENAI_API_KEY` is set correctly
- ✅ Check the API key has the necessary permissions

### Streaming not working
- ✅ Check browser console for errors
- ✅ Verify the response format matches expected output
- ✅ Check network tab in browser dev tools

### Build errors on Vercel
- ✅ Make sure `OPENAI_API_KEY` is set in Vercel Environment Variables
- ✅ Check deployment logs for specific errors
- ✅ Verify all dependencies are installed

## API Reference

### Endpoint
```
POST https://api.openai.com/v1/responses
```

### Headers
```typescript
{
  "Content-Type": "application/json",
  "Authorization": "Bearer YOUR_API_KEY"
}
```

### Request Body
```typescript
{
  "prompt": {
    "id": string,      // Your prompt ID
    "version": string  // Prompt version
  },
  "input": string,     // User's input message
  "stream": boolean    // Enable streaming (true)
}
```

### Response
Streams back in Server-Sent Events (SSE) format.

## Documentation

- [OpenAI Responses API Docs](https://platform.openai.com/docs/api-reference/responses/create)
- [OpenAI Prompts Dashboard](https://platform.openai.com/prompts)

## Reverting to Standard Chat API

If you need to revert to the traditional Chat Completions API:

```bash
git log --oneline
git checkout <commit-before-responses-api>
```

Or manually update `app/api/chat/route.ts` to use the standard chat completions endpoint.

