# Setup Instructions for official-welthra

## Quick Start

### 1. Add Your OpenAI API Key

**IMPORTANT**: The chat won't work without an OpenAI API key!

Create a `.env.local` file in the project root:

```bash
cp .env.local.example .env.local
```

Then edit `.env.local` and add your OpenAI API key:

```bash
OPENAI_API_KEY=sk-your-actual-api-key-here
```

Get your API key from: https://platform.openai.com/api-keys

### 2. Install Dependencies

```bash
npm install
```

### 3. Run the Development Server

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

### 4. Test the Chat

Send a message in the chat interface. You should see a response from the AI assistant.

## Configuration

### Prompt Configuration

Your prompt is configured in `app/api/chat/config.ts`:

```typescript
export const PROMPT_CONFIG = {
  id: "pmpt_691128564e1c8193a7ad265787d23e7808fb0688728fa766",
  version: "1",
};
```

The system uses this prompt ID in the system message to reference your OpenAI prompt configuration.

### Environment Variables

- `OPENAI_API_KEY` (Required) - Your OpenAI API key

## Deployment to Vercel

### 1. Push to GitHub

```bash
git add .
git commit -m "Your changes"
git push origin main
```

### 2. Add API Key in Vercel

1. Go to your Vercel project settings
2. Navigate to **Environment Variables**
3. Add `OPENAI_API_KEY` with your key
4. Select all environments (Production, Preview, Development)
5. Click **Save**

### 3. Redeploy

Vercel will automatically redeploy when you push to GitHub. Or manually redeploy from the Vercel dashboard.

## Troubleshooting

### Chat not responding

**Cause**: OpenAI API key not set  
**Solution**: Make sure `.env.local` exists with your API key, then restart the dev server

```bash
# Stop the server (Ctrl+C)
npm run dev
```

### "401 Unauthorized" error

**Cause**: Invalid API key  
**Solution**: Check that your API key is correct and active at https://platform.openai.com/api-keys

### Build errors

**Cause**: Missing dependencies or syntax errors  
**Solution**: 
```bash
npm install
npm run build
```

### OpenAI rate limit errors

**Cause**: Too many requests to OpenAI API  
**Solution**: Wait a few moments and try again, or upgrade your OpenAI plan

## Project Structure

```
assistant-ui-app/
├── app/
│   ├── api/chat/
│   │   ├── route.ts          # Main chat API endpoint
│   │   └── config.ts          # Prompt configuration
│   ├── assistant.tsx          # Assistant UI component
│   ├── page.tsx               # Main page
│   └── layout.tsx             # Root layout
├── components/
│   └── assistant-ui/          # UI components
├── .env.local                 # Your API keys (DO NOT COMMIT)
├── .env.local.example         # Example env file
└── package.json               # Dependencies
```

## Documentation

- [RESPONSES_API.md](./RESPONSES_API.md) - Detailed API documentation
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment guide
- [OpenAI API Docs](https://platform.openai.com/docs/api-reference)
- [assistant-ui Docs](https://github.com/Yonom/assistant-ui)

## Support

If you encounter any issues:

1. Check the console for error messages
2. Verify your API key is correct
3. Ensure you have the latest code from GitHub
4. Check the [troubleshooting section](#troubleshooting)

## Security Note

**NEVER commit your `.env.local` file to Git!**

The `.env.local` file is already in `.gitignore` to prevent accidental commits.

