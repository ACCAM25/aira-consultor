revoke all on public.consulting_cases, public.case_documents, public.case_entries from anon, authenticated;
comment on table public.consulting_cases is 'LEGADO (Diagnóstico Express migrado do Base44). Sem acesso pelo app; pode ser removida.';
comment on table public.case_documents is 'LEGADO. Sem acesso pelo app; pode ser removida.';
comment on table public.case_entries is 'LEGADO. Sem acesso pelo app; pode ser removida.';
update storage.buckets set allowed_mime_types = array['application/x-legacy-disabled'] where id = 'case-files';
