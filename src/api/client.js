// Camada de dados do AIra Consultor sobre o Supabase.
// Mantém a mesma forma de uso herdada do Base44 (entities.X.filter, functions.invoke etc.)
// para que as telas não precisem mudar. Toda leitura e gravação passa pelo RLS do banco.
import { supabase } from './supabaseClient';

const BUCKET = 'case-files';

function orderOf(sort) {
  if (!sort) return null;
  const descending = sort.startsWith('-');
  return { column: descending ? sort.slice(1) : sort, ascending: !descending };
}

function fail(error) {
  if (error) throw new Error(error.message || 'Falha ao acessar os dados.');
}

function entity(table) {
  const run = async (query, sort, limit, skip) => {
    const order = orderOf(sort);
    if (order) query = query.order(order.column, { ascending: order.ascending });
    if (limit) query = query.range(skip || 0, (skip || 0) + limit - 1);
    const { data, error } = await query;
    fail(error);
    return data || [];
  };
  return {
    list: (sort, limit, skip) => run(supabase.from(table).select('*'), sort, limit, skip),
    filter: (criteria = {}, sort, limit, skip) => run(supabase.from(table).select('*').match(criteria), sort, limit, skip),
    get: async (id) => {
      const { data, error } = await supabase.from(table).select('*').eq('id', id).maybeSingle();
      fail(error);
      return data;
    },
    create: async (values) => {
      const { data, error } = await supabase.from(table).insert(values).select().single();
      fail(error);
      return data;
    },
    update: async (id, values) => {
      const { data, error } = await supabase.from(table).update(values).eq('id', id).select().maybeSingle();
      fail(error);
      return data;
    },
    delete: async (id) => {
      if (table === 'case_documents') {
        const { data } = await supabase.from(table).select('file_uri').eq('id', id).maybeSingle();
        if (data?.file_uri) await supabase.storage.from(BUCKET).remove([data.file_uri]);
      }
      const { error } = await supabase.from(table).delete().eq('id', id);
      fail(error);
    },
    count: async (criteria = {}) => {
      const { count, error } = await supabase.from(table).select('id', { count: 'exact', head: true }).match(criteria);
      fail(error);
      return count || 0;
    },
  };
}

const functionNames = {
  analyzeCase: 'analyze-case',
  revalidateObjective: 'revalidate-objective',
  exportAnamnesis: 'export-anamnesis',
};

async function currentUserId() {
  const { data } = await supabase.auth.getUser();
  if (!data.user) throw new Error('Sessão expirada. Entre novamente.');
  return data.user.id;
}

export const api = {
  entities: {
    ConsultingCase: entity('consulting_cases'),
    CaseDocument: entity('case_documents'),
    CaseEntry: entity('case_entries'),
  },
  functions: {
    invoke: async (name, body) => {
      const { data, error } = await supabase.functions.invoke(functionNames[name] || name, { body });
      if (error) {
        let message = error.message;
        try {
          const payload = await error.context?.json?.();
          if (payload?.error) message = payload.error;
        } catch { /* corpo não era JSON */ }
        throw new Error(message || 'Falha ao executar a análise.');
      }
      return { data };
    },
  },
  integrations: {
    Core: {
      UploadPrivateFile: async ({ file }) => {
        const userId = await currentUserId();
        const safeName = file.name.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^\w.-]+/g, '_');
        const path = `${userId}/${crypto.randomUUID()}-${safeName}`;
        const { error } = await supabase.storage.from(BUCKET).upload(path, file, { contentType: file.type || undefined });
        fail(error);
        return { file_uri: path };
      },
      CreateFileSignedUrl: async ({ file_uri, expires_in = 300 }) => {
        const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(file_uri, expires_in);
        fail(error);
        return { signed_url: data.signedUrl };
      },
    },
  },
  auth: {
    me: async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) throw new Error('Não autenticado.');
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', data.user.id).maybeSingle();
      return { id: data.user.id, email: data.user.email, full_name: profile?.full_name || data.user.user_metadata?.full_name || '', role: profile?.role || 'user' };
    },
  },
};
