create index if not exists projects_created_by_idx on public.projects (created_by);
create index if not exists records_created_by_idx on public.records (created_by);
create index if not exists records_updated_by_idx on public.records (updated_by);
