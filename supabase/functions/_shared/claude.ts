const MODEL = () => Deno.env.get('ANTHROPIC_MODEL') || 'claude-sonnet-5-5';

/** Chamada simples ao Claude; devolve o texto da resposta. */
export async function askClaude({ system, prompt, maxTokens = 4000 }: { system: string; prompt: string; maxTokens?: number }): Promise<string> {
  const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
  if (!apiKey) throw new Error('O assistente ainda não está ativo: cadastre a chave ANTHROPIC_API_KEY nos secrets do Supabase.');
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
    body: JSON.stringify({ model: MODEL(), max_tokens: maxTokens, system, messages: [{ role: 'user', content: prompt }] }),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(`Falha na chamada à IA: ${body?.error?.message || res.status}`);
  return (body.content || []).filter((b: { type: string }) => b.type === 'text').map((b: { text: string }) => b.text).join('\n').trim();
}
