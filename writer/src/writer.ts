import { generateText } from './llm';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import { ESSAYS_CONTENT } from './essays-data';
import { searchRag } from './rag';

export interface EssayRequestData {
    essayName: string;
    essaySlug: string;
    webhookUrl: string;
    /** Optional LLM model identifier (e.g. "openai/gpt-4o-mini-2024-05-13") */
    model?: string;
}

export interface EssayResponse {
    success: boolean;
    essaySlug: string;
    essayName: string;
    essayText: string;
    /** Model actually used to generate this essay */
    modelUsed: string;
    error: string;
}

export async function generateEssay(env: Env, requestData: EssayRequestData): Promise<EssayResponse> {
    const { essayName, essaySlug } = requestData;
    const modelToUse = requestData.model || 'google/gemini-2.5-flash-preview';
    
    console.log(`[ESSAY-QUEUE] Starting generation for essay "${essayName}" (${essaySlug})`);
    const startTime = Date.now();
    
    try {
        console.log(`[ESSAY-QUEUE] Fetching RAG content for "${essayName}"`);
        // Get relevant essays using RAG
        const ragResults = await searchRag(env, essayName);
        console.log(`[ESSAY-QUEUE] RAG search complete. Found ${ragResults.data?.length || 0} relevant items`);
        
        // Use a substantial portion of the essays content to leverage the model's large context window
        // This gives the model plenty of reference material to understand Paul Graham's writing style
        
        // Create a system prompt that instructs the model to write like Paul Graham
        const systemPrompt = `You are Paul Graham, the renowned programmer, venture capitalist, and essayist. 

You founded Viaweb (which became Yahoo Store), worked on Lisp, cofounded Y Combinator, and have written extensively about startups, programming, and life philosophy. Your writing style is characterized by:

1. Clear, direct language with short, punchy sentences
2. Strong, controversial opinions stated matter-of-factly
3. Personal anecdotes and observations that reveal larger truths
4. Technical analogies and references to startups, programming, and Silicon Valley
5. A preference for simple language over jargon
6. Thoughtful, contrarian positions on conventional wisdom
7. The ability to make complex topics accessible through clear explanations

Write a new essay in your distinctive voice and style on the given topic. The essay should feel like it was genuinely written by Paul Graham himself.`;
        
        // Extract text passages from RAG results to feed to the model
        const ragContent = ragResults.data
            ?.map(item => item.content.map(c => c.text).join("\n"))
            .join("\n\n");
        
        // Build our message array with system prompt, essay reference, RAG results, and user request
        const messages: ChatCompletionMessageParam[] = [
            {
                role: 'system',
                content: systemPrompt,
            },
            {
                role: 'user',
                content: `I want you to write a new essay in the style of Paul Graham on the topic: "${essayName}"

Here are some relevant passages from your previous essays on this topic:

${ragContent}

As a reference, here's a collection of your writing style and topics from your past essays. Don't reference these directly, but use them to inform your tone, style, and thought patterns:

${ESSAYS_CONTENT}

Write a new, original essay on "${essayName}" that captures your authentic voice, perspective, and typical essay structure.

The title of the essay should be: "${essayName}". Return only the essay text as well formatted markdown and nothing else.`,
            },
        ];

        console.log(`[ESSAY-QUEUE] Prompt prepared. Generating essay with LLM (model: ${modelToUse})...`);
        const essayText = await generateText(env, modelToUse, messages);
        const generationTime = ((Date.now() - startTime) / 1000).toFixed(2);
        console.log(`[ESSAY-QUEUE] Essay generation complete in ${generationTime}s. Length: ${essayText.length} chars`);
        
        // Clean up the essay text by removing any leading H1 heading, including any leading whitespace/newlines
        const cleanedEssayText = essayText.replace(/^\s*#\s*.*\n/, '');
        
        return {
            success: true,
            essaySlug,
            essayName,
            essayText: cleanedEssayText,
            modelUsed: modelToUse,
            error: ''
        };
    } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred while generating essay';
        console.error(`[ESSAY-QUEUE] Essay generation failed: ${errorMsg}`);
        console.error(`[ESSAY-QUEUE] Error details:`, error);
        return {
            success: false,
            essaySlug,
            essayName,
            essayText: '',
            modelUsed: modelToUse,
            error: errorMsg
        };
    }
}

export async function sendEssayToWebhook(webhookUrl: string, essayResponse: EssayResponse): Promise<void> {
    console.log(`[ESSAY-QUEUE] Sending essay to webhook: ${webhookUrl}`);
    const webhookStartTime = Date.now();
    
    const webhookResponse = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(essayResponse),
    });
    
    if (!webhookResponse.ok) {
        console.error(`[ESSAY-QUEUE] Webhook request failed with status ${webhookResponse.status}`);
        if (webhookResponse.headers.get('content-type')?.includes('application/json')) {
            try {
                const errorData = await webhookResponse.json();
                console.error(`[ESSAY-QUEUE] Webhook error response:`, errorData);
            } catch (e) {
                console.error(`[ESSAY-QUEUE] Could not parse error response as JSON`);
            }
        }
        throw new Error(`Webhook request failed with status ${webhookResponse.status}`);
    }
    
    const webhookTime = ((Date.now() - webhookStartTime) / 1000).toFixed(2);
    console.log(`[ESSAY-QUEUE] Webhook successfully called in ${webhookTime}s`);
}
