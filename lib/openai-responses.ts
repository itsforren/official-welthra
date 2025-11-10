/**
 * OpenAI Responses API (Prompts API) client
 * This handles calls to OpenAI's Responses API for prompt management
 */

export interface ResponsesAPIConfig {
  promptId: string;
  version: string;
  input?: string | Record<string, unknown>;
  stream?: boolean;
}

export async function callResponsesAPI(config: ResponsesAPIConfig) {
  const { promptId, version, input, stream = true } = config;

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not set");
  }

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        prompt: {
          id: promptId,
          version: version,
        },
        input: input,
        stream: stream,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI Responses API error: ${response.status} - ${error}`);
    }

    return response;
  } catch (error) {
    console.error("Error calling OpenAI Responses API:", error);
    throw error;
  }
}

