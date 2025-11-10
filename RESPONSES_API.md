# OpenAI Responses API Integration

## What Changed

The assistant-ui app now uses **OpenAI's Responses API** (Prompts API) instead of the traditional chat completions API. This allows you to manage and version your prompts directly in OpenAI's platform.

## Current Configuration

### Prompt Details
- **Prompt ID**: `pmpt_691128564e1c8193a7ad265787d23e7808fb0688728fa766`
- **Version**: `1`

You can update these values in: `app/api/chat/config.ts`

## How It Works

1. **User sends a message** in the chat
2. **API extracts the latest message** and sends it as `input` to the Responses API
3. **OpenAI uses your prompt** (stored in their platform) along with the user's input
4. **Response is streamed back** to the user in real-time

## Code Structure

```
app/api/chat/
├── route.ts       # Main API endpoint using Responses API
└── config.ts      # Prompt configuration (ID and version)
```

## Benefits of Responses API

✅ **Centralized Prompt Management** - Edit prompts in OpenAI's dashboard without code changes
✅ **Version Control** - Track and rollback prompt versions
✅ **A/B Testing** - Test different prompt versions easily
✅ **Team Collaboration** - Share prompts across team members
✅ **Audit Trail** - See who changed what and when

## Updating Your Prompt

### Option 1: Edit config.ts
```typescript
export const PROMPT_CONFIG = {
  id: "your_new_prompt_id",
  version: "2",
};
```

### Option 2: Use Environment Variables
Update `config.ts`:
```typescript
export const PROMPT_CONFIG = {
  id: process.env.OPENAI_PROMPT_ID || "pmpt_...",
  version: process.env.OPENAI_PROMPT_VERSION || "1",
};
```

Then add to Vercel:
- `OPENAI_PROMPT_ID` = your prompt ID
- `OPENAI_PROMPT_VERSION` = version number

## Managing Prompts in OpenAI

1. Go to: https://platform.openai.com/prompts
2. Create or edit your prompt
3. Copy the Prompt ID
4. Update `config.ts` or environment variables
5. Redeploy or restart your dev server

## API Reference

The code uses:
```typescript
const response = await openai.responses.create({
  prompt: {
    id: PROMPT_CONFIG.id,
    version: PROMPT_CONFIG.version,
  },
  input: userMessage,  // User's message
  stream: true,        // Enable streaming
});
```

## Testing Locally

1. Make sure `OPENAI_API_KEY` is set in `.env.local`
2. Run: `npm run dev`
3. Visit: http://localhost:3000
4. Send a message to test the prompt

## Troubleshooting

**Error: "Prompt not found"**
- Verify the prompt ID is correct
- Check that the version exists
- Ensure your API key has access to the prompt

**Error: "Invalid input"**
- Check that your prompt accepts an `input` parameter
- Review the prompt configuration in OpenAI's dashboard

**Streaming not working**
- Ensure `stream: true` is set in the API call
- Check browser console for errors

## Reverting to Standard Chat API

If you want to go back to the traditional API, see the git history:
```bash
git log --oneline
git show b8dd4e6  # View the old implementation
```

Or check the commit before: "Update to use OpenAI Responses API with prompt ID"

