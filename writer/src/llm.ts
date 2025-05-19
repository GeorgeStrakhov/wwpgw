import OpenAI from 'openai';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

export async function generateText(
  env: Env,
  model: string = "google/gemini-2.5-flash-preview",
  messages: ChatCompletionMessageParam[]
): Promise<string> {
  const openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: env.OPENROUTER_API_KEY,
  });

  try {
    const completion = await openai.chat.completions.create({
      model,
      messages,
      temperature: 0.7,
      max_tokens: 4000, // Allow for longer essay generation
    });

    // Return the generated text
    return completion.choices[0].message.content || '';
  } catch (error) {
    console.error('Error generating text:', error);
    throw new Error(`Failed to generate text: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
