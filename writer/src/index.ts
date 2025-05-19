/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Bind resources to your worker in `wrangler.jsonc`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

import { generateEssay, sendEssayToWebhook, type EssayRequestData } from './writer';
import { searchRag } from './rag';

// Minimal local typings for queue batches
type QueueMessage<T> = {
	body: T;
	ack: () => void;
	retry: () => void;
};

interface MessageBatch<T = unknown> {
	messages: QueueMessage<T>[];
	retryAll: () => void;
}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		// Check authorization for all routes
		const authResponse = checkAuthorization(request, env);
		if (authResponse) {
			return authResponse;
		}
		
		const url = new URL(request.url);
		
		// Handle /v1/generateEssay endpoint
		if (url.pathname === '/v1/generateEssay' && request.method === 'POST') {
			// Check for required parameters
			let requestData: EssayRequestData;
			try {
				requestData = await request.json() as EssayRequestData;
			} catch (error) {
				return new Response('Bad Request: Invalid JSON', { status: 400 });
			}
			
			const { essayName, essaySlug, webhookUrl } = requestData;
			if (!essayName || !essaySlug || !webhookUrl) {
				return new Response('Bad Request: Missing required parameters (essayName, essaySlug, webhookUrl)', { status: 400 });
			}
			
			// Enqueue the request for asynchronous processing
			try {
				await env.GENERATE_ESSAY_QUEUE.send(requestData);
			} catch (error: unknown) {
				const errorMessage = error instanceof Error ? error.message : 'Unknown error adding job to queue';
				return new Response(JSON.stringify({ success: false, error: errorMessage }), {
					status: 500,
					headers: { 'Content-Type': 'application/json' },
				});
			}

			return new Response(JSON.stringify({ success: true, message: 'Request queued successfully' }), {
				headers: { 'Content-Type': 'application/json' },
			});
		}
		
		// Handle /rag endpoint
		if (url.pathname === '/v1/rag' && request.method === 'GET') {
			const query = url.searchParams.get('query');
			if (!query) {
				return new Response('Bad Request: Missing query parameter', { 
					status: 400,
					headers: { 'Content-Type': 'application/json' }
				});
			}

			try {
				const ragResponse = await searchRag(env, query);
				return new Response(JSON.stringify(ragResponse), {
					headers: {
						'Content-Type': 'application/json',
					},
				});
			} catch (error: unknown) {
				const errorMessage = error instanceof Error ? error.message : 'Unknown error';
				return new Response(JSON.stringify({ error: errorMessage }), { 
					status: 500,
					headers: { 'Content-Type': 'application/json' }
				});
			}
		}
		
		// Return 404 for all other routes
		return new Response('Not Found', { status: 404 });
	},

	/**
	 * Queue consumer handler for GENERATE_ESSAY_QUEUE
	 */
	async queue(batch: any, env: Env, ctx: ExecutionContext): Promise<void> {
		for (const message of batch.messages) {
			const requestData = message.body as EssayRequestData;
			try {
				const essayResponse = await generateEssay(env, requestData);
				await sendEssayToWebhook(requestData.webhookUrl, essayResponse);
				message.ack();
			} catch (error) {
				// On any error, retry the message so it can be processed again
				message.retry();
			}
		}
	},
} satisfies ExportedHandler<Env>;

/**
 * Check if the request has valid authorization
 * @returns Response object if authorization fails, null if it passes
 */
function checkAuthorization(request: Request, env: Env): Response | null {
	const authHeader = request.headers.get('Authorization');
	if (!authHeader || !authHeader.startsWith('Bearer ')) {
		return new Response('Unauthorized: Missing or invalid Authorization header', { status: 401 });
	}

	const token = authHeader.replace('Bearer ', '');
	if (token !== env.INCOMING_API_KEY) {
		return new Response('Unauthorized: Invalid API key', { status: 401 });
	}
	
	return null;
}

// Extend the global Env interface with the queue binding while preserving existing keys
declare global {
	interface Env {
		GENERATE_ESSAY_QUEUE: Queue;
	}
}
