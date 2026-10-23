import mammoth from 'npm:mammoth@1.8.0';
import { Buffer } from 'node:buffer';

function encodeBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(binary);
}

export type CaseFile = { name: string; bytes: Uint8Array };

const MODEL = () => Deno.env.get('ANTHROPIC_MODEL') || 'claude-sonnet-5-5';

/** Converte um arquivo do caso em bloco de conteúdo do Claude. PDF vai nativo; DOCX e TXT viram texto. */
async function toBlock(file: CaseFile): Promise<Record<string, unknown> | null> {
  const lower = file.name.toLowerCase();
  if (lower.endsWith('.pdf')) {
    return { type: 'document', title: file.name, source: { type: 'base64', media_type: 'application/pdf', data: encodeBase64(file.bytes) } };
  }
  let text = '';
  if (lower.endsWith('.docx')) {
    const result = await mammoth.extractRawText({ buffer: Buffer.from(file.bytes) });
    text = result.value || '';
  } else if (lower.endsWith('.txt')) {
    text = new TextDecoder().decode(file.bytes);
  }
  if (!text.trim()) return null;
  return { type: 'document', title: file.name, source: { type: 'text', media_type: 'text/plain', data: text.slice(0, 400000) } };
}

/**
 * Chama o Claude e força a resposta no formato do schema (via tool use),
 * equivalente ao InvokeLLM com response_json_schema do Base44.
 */
export async function invokeClaude<T>({ prompt, files = [], schema, maxTokens = 8000 }: {
  prompt: string; files?: CaseFile[]; schema: Record<string, unknown>; maxTokens?: number;
}): Promise<{ result: T; unreadable: string[] }> {
  const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
  if (!apiKey) throw new Error('A chave da IA (ANTHROPIC_API_KEY) não está configurada no Supabase.');
  const content: Record<string, unknown>[] = [];
  const unreadable: string[] = [];
  for (const file of files) {
    try {
      const block = await toBlock(file);
      if (block) content.push(block); else unreadable.push(file.name);
    } catch {
      unreadable.push(file.name);
    }
  }
  const note = unreadable.length ? `\n\nArquivos que não puderam ser convertidos para leitura: ${unreadable.join(', ')}. Reporte-os como nao_lido.` : '';
  content.push({ type: 'text', text: prompt + note });
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
    body: JSON.stringify({
      model: MODEL(),
      max_tokens: maxTokens,
      tools: [{ name: 'registrar_resultado', description: 'Registra o resultado estruturado da análise.', input_schema: schema }],
      tool_choice: { type: 'tool', name: 'registrar_resultado' },
      messages: [{ role: 'user', content }],
    }),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(`Falha na chamada à IA: ${body?.error?.message || res.status}`);
  const call = (body.content || []).find((block: { type: string }) => block.type === 'tool_use');
  if (!call) throw new Error('A IA não devolveu um resultado estruturado.');
  return { result: call.input as T, unreadable };
}
