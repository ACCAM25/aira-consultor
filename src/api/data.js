// Acesso a dados do AIra Consultor (Supabase + React Query). Todo acesso passa pelo RLS.
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from './supabaseClient';

const BUCKET = 'project-files';

function check({ data, error }) {
  if (error) throw new Error(error.message || 'Falha ao acessar os dados.');
  return data;
}

export function useProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: async () => check(await supabase.from('projects').select('*, project_members(role, user_id)').order('updated_at', { ascending: false })),
  });
}

export function useProject(id) {
  return useQuery({
    queryKey: ['project', id],
    enabled: !!id,
    queryFn: async () => check(await supabase.from('projects').select('*').eq('id', id).maybeSingle()),
  });
}

export function useRecords(projectId) {
  return useQuery({
    queryKey: ['records', projectId],
    enabled: !!projectId,
    queryFn: async () => check(await supabase.from('records').select('*').eq('project_id', projectId).order('created_at', { ascending: true })),
  });
}

export function useMembers(projectId) {
  return useQuery({
    queryKey: ['members', projectId],
    enabled: !!projectId,
    queryFn: async () => check(await supabase.from('project_members').select('*').eq('project_id', projectId).order('created_at')),
  });
}

export function useHistory(projectId, limit = 25) {
  return useQuery({
    queryKey: ['history', projectId],
    enabled: !!projectId,
    queryFn: async () => check(await supabase.from('record_history').select('*').eq('project_id', projectId).order('changed_at', { ascending: false }).limit(limit)),
  });
}

export function useMyRole(projectId) {
  return useQuery({
    queryKey: ['role', projectId],
    enabled: !!projectId,
    queryFn: async () => check(await supabase.rpc('project_role', { pid: projectId })),
  });
}

export async function updateProjectById(id, values) {
  return check(await supabase.from('projects').update(values).eq('id', id).select().single());
}

export async function createProject(values) {
  return check(await supabase.from('projects').insert(values).select().single());
}

export function useUpdateProject(projectId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async patch => check(await supabase.from('projects').update(patch).eq('id', projectId).select().single()),
    onSuccess: data => { qc.setQueryData(['project', projectId], data); qc.invalidateQueries({ queryKey: ['projects'] }); },
  });
}

export function useSaveRecord(projectId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...values }) => {
      const payload = { ...values, project_id: projectId };
      return id
        ? check(await supabase.from('records').update(payload).eq('id', id).select().single())
        : check(await supabase.from('records').insert(payload).select().single());
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['records', projectId] });
      qc.invalidateQueries({ queryKey: ['history', projectId] });
    },
  });
}

export function useInviteMember(projectId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ email, role }) => check(await supabase.from('project_members').insert({ project_id: projectId, email, role }).select().single()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['members', projectId] }),
  });
}

export function useRemoveMember(projectId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async id => check(await supabase.from('project_members').delete().eq('id', id)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['members', projectId] }),
  });
}

export async function uploadProjectFile(projectId, file) {
  const safe = file.name.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^\w.-]+/g, '_');
  const path = `${projectId}/${crypto.randomUUID()}-${safe}`;
  check(await supabase.storage.from(BUCKET).upload(path, file, { contentType: file.type || undefined }));
  return { path, name: file.name, size: file.size };
}

export async function openProjectFile(path) {
  const data = check(await supabase.storage.from(BUCKET).createSignedUrl(path, 300));
  window.open(data.signedUrl, '_blank', 'noopener,noreferrer');
}

export async function readDocuments(projectId, files) {
  const { data, error } = await supabase.functions.invoke('aira-extract', { body: { projectId, files } });
  if (error) {
    let message = error.message;
    try { const payload = await error.context?.json?.(); if (payload?.error) message = payload.error; } catch { /* sem corpo */ }
    throw new Error(message || 'A leitura dos documentos falhou.');
  }
  return data;
}

export async function askAira(action, projectId, extra = {}) {
  const { data, error } = await supabase.functions.invoke('aira-assist', { body: { action, projectId, ...extra } });
  if (error) {
    let message = error.message;
    try { const payload = await error.context?.json?.(); if (payload?.error) message = payload.error; } catch { /* sem corpo */ }
    throw new Error(message || 'O assistente não respondeu.');
  }
  return data;
}
