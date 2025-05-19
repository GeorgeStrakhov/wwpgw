import { Groq } from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { content } = body;

    if (!content) {
      throw createError({
        statusCode: 400,
        message: 'Content is required',
      });
    }

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: `check this content on profanity, inflammatory meaning or making sense. return JSON.
nonsense should not be allowed, profanity or explicit things should not be allowed. content that is politically or socially inflaming should not be allowed.

The structure for JSON return should be:
{
"isFlagged": bool,
"reasonFlagged": string (empty string if not flagged and human-understandable reason in one sentence if it is inappropriate)
}

nonsensical content should not be allowed.
only accept essay titles that make sense for Paul Graham to write about and are not too long.

Content for you to evaluate:
"${content}"`,
        },
      ],
      model: 'llama-3.1-8b-instant',
      temperature: 1,
      max_completion_tokens: 1024,
      top_p: 1,
      stream: false,
      response_format: {
        type: 'json_object',
      },
      stop: null,
    });

    const responseContent = chatCompletion.choices[0].message.content;
    if (!responseContent) {
      throw createError({
        statusCode: 500,
        message: 'No content received from moderation service',
      });
    }
    const result = JSON.parse(responseContent);
    return result;
  } catch (error) {
    console.error('Moderation error:', error);
    throw createError({
      statusCode: 500,
      message: 'Error during content moderation',
    });
  }
});
