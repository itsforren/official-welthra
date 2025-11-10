// OpenAI Responses API Configuration
// Using environment variables for prompt configuration

export const PROMPT_CONFIG = {
  // Your OpenAI prompt ID from environment variable
  id: process.env.OPENAI_PROMPT_ID || "pmpt_691128564e1c8193a7ad265787d23e7808fb0688728fa766",
  // Prompt version
  version: process.env.OPENAI_PROMPT_VERSION || "1",
};

