export async function searchRag(env: Env, query: string) {
    const answer = await env.AI.autorag("pgessays-rag").search({
        query: query,
    });
    return answer;
}