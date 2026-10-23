import type { SupabaseClient } from 'npm:@supabase/supabase-js@2.45.4';
import { BUCKET } from './context.ts';
import type { CaseFile } from './claude.ts';

export async function downloadCaseFiles(db: SupabaseClient, documents: { name: string; file_uri: string }[]): Promise<{ files: CaseFile[]; failed: string[] }> {
  const files: CaseFile[] = [];
  const failed: string[] = [];
  for (const doc of documents) {
    const { data, error } = await db.storage.from(BUCKET).download(doc.file_uri);
    if (error || !data) { failed.push(doc.name); continue; }
    files.push({ name: doc.name, bytes: new Uint8Array(await data.arrayBuffer()) });
  }
  return { files, failed };
}
