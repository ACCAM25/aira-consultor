import mammoth from 'npm:mammoth@1.8.0';
import { Buffer } from 'node:buffer';

const MODEL = () => Deno.env.get('ANTHROPIC_MODEL') || 'claude-sonnet-5-5';
const API = 'https://api.anthropic.com/v1/messages';

function apiKey() {
  const key = Deno.env.get('ANTHROPIC_API_KEY');
  if (!key) throw new Error('O assistente ainda não está ativo: cadastre a chave ANTHROPIC_API_KEY nos secrets do Supabase.');
  return key;
}

async function call(body: Record<string, unknown>) {
  const res = await fetch(API, {
    method: 'POST',
    headers: { 'x-api-key': apiKey(), 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
    body: JSON.stringify({ model: MODEL(), ...body }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`Falha na chamada à IA: ${json?.error?.message || res.status}`);
  return json;
}

/** Chamada simples ao Claude; devolve o texto da resposta. */
export async function askClaude({ system, prompt, maxTokens = 4000 }: { system: string; prompt: string; maxTokens?: number }): Promise<string> {
  const body = await call({ max_tokens: maxTokens, system, messages: [{ role: 'user', content: prompt }] });
  return (body.content || []).filter((b: { type: string }) => b.type === 'text').map((b: { text: string }) => b.text).join('\n').trim();
}

export type SourceFile = { name: string; bytes: Uint8Array };

function base64(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(binary);
}

/** Converte arquivo em bloco de documento do Claude. PDF vai nativo; DOCX e TXT viram texto. */
export async function toDocumentBlock(file: SourceFile): Promise<Record<string, unknown> | null> {
  const lower = file.name.toLowerCase();
  if (lower.endsWith('.pdf')) return { type: 'document', title: file.name, source: { type: 'base64', media_type: 'application/pdf', data: base64(file.bytes) } };
  let text = '';
  if (lower.endsWith('.docx')) text = (await mammoth.extractRawText({ buffer: Buffer.from(file.bytes) })).value || '';
  else if (/\.(txt|md|csv|vtt|srt)$/.test(lower)) text = new TextDecoder().decode(file.bytes);
  if (!text.trim()) return null;
  return { type: 'document', title: file.name, source: { type: 'text', media_type: 'text/plain', data: text.slice(0, 400000) } };
}

/** Chama o Claude com documentos e pede a resposta em JSON conforme o schema. */
export async function extractWithClaude<T>({ system, prompt, files, schema, maxTokens = 12000 }: {
  system: string; prompt: string; files: SourceFile[]; schema: Record<string, unknown>; maxTokens?: number;
}): Promise<{ result: T; unreadable: string[] }> {
  const content: Record<string, unknown>[] = [];
  const unreadable: string[] = [];
  for (const f of files) {
    try { const block = await toDocumentBlock(f); if (block) content.push(block); else unreadable.push(f.name); } catch { unreadable.push(f.name); }
  }
  if (!content.length) throw new Error('Nenhum dos arquivos pôde ser lido. Use PDF, DOCX ou TXT com texto selecionável.');
  const instruction = `${prompt}

Formato da resposta: devolva SOMENTE um objeto JSON válido (sem texto antes ou depois, sem markdown), que siga este JSON Schema. Omita as chaves que os documentos não sustentarem.
${JSON.stringify(schema)}`;
  content.push({ type: 'text', text: instruction });
  let lastError = '';
  for (let attempt = 0; attempt < 2; attempt++) {
    const body = await call({ max_tokens: maxTokens, system, messages: [{ role: 'user', content }] });
    const text = (body.content || []).filter((b: { type: string }) => b.type === 'text').map((b: { text: string }) => b.text).join('\n');
    console.log('claude', JSON.stringify({ tentativa: attempt + 1, stop: body.stop_reason, uso: body.usage, inicio: text.slice(0, 300) }));
    const parsed = parseJson(text);
    if (parsed) return { result: parsed as T, unreadable };
    lastError = body.stop_reason === 'max_tokens' ? 'resposta longa demais' : 'JSON inválido';
  }
  throw new Error(`A IA não devolveu propostas legíveis (${lastError}). Tente de novo ou envie menos arquivos.`);
}

function parseJson(text: string): Record<string, unknown> | null {
  const clean = text.replace(/```(?:json)?/g, '');
  const start = clean.indexOf('{');
  const end = clean.lastIndexOf('}');
  if (start < 0 || end <= start) return null;
  try { const v = JSON.parse(clean.slice(start, end + 1)); return v && typeof v === 'object' ? v : null; } catch { return null; }
}
