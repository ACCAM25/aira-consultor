import { createClient, type SupabaseClient, type User } from 'npm:@supabase/supabase-js@2.45.4';

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

export function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
}

/** Cliente com o JWT do usuário: todas as leituras e gravações passam pelo RLS. */
export async function userContext(req: Request): Promise<{ db: SupabaseClient; user: User } | null> {
  const authorization = req.headers.get('Authorization');
  if (!authorization) return null;
  const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {
    global: { headers: { Authorization: authorization } },
    auth: { persistSession: false },
  });
  const { data, error } = await db.auth.getUser(authorization.replace(/^Bearer\s+/i, ''));
  if (error || !data.user) return null;
  return { db, user: data.user };
}

export function handle(fn: (req: Request) => Promise<Response>) {
  return async (req: Request) => {
    if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
    try {
      return await fn(req);
    } catch (error) {
      console.error(error);
      return json({ error: (error as Error).message || 'Falha inesperada.' }, 500);
    }
  };
}

export const BUCKET = 'project-files';
