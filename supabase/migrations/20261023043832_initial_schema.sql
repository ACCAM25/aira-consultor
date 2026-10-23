create extension if not exists pgcrypto with schema extensions;

-- IDs de 24 caracteres hexadecimais, compatíveis com os registros migrados do Base44.
create or replace function public.new_id() returns text language sql volatile set search_path = '' as $$
  select encode(extensions.gen_random_bytes(12), 'hex')
$$;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  role text not null default 'user' check (role in ('admin','user')),
  created_date timestamptz not null default now()
);

create or replace function public.is_admin() returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.profiles where id = (select auth.uid()) and role = 'admin')
$$;

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'));
  return new;
end $$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.touch_updated_date() returns trigger language plpgsql set search_path = '' as $$
begin new.updated_date = now(); return new; end $$;

create table public.consulting_cases (
  id text primary key default public.new_id(),
  title text not null,
  sector text not null check (sector in ('publico','privado')),
  objective text not null,
  company_website text check (company_website is null or length(company_website) <= 2048),
  status text not null default 'novo' check (status in ('novo','em_analise','parecer_emitido','pendente','conducao_usuario')),
  diagnostic_stage text not null default 'processes' check (diagnostic_stage in ('processes','problems','dimensioning','triage','ranking','complete')),
  pending_question text default '',
  pending_reason text default '',
  objective_revalidation_needed boolean not null default false,
  created_by_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now()
);

create table public.case_documents (
  id text primary key default public.new_id(),
  case_id text not null references public.consulting_cases(id) on delete cascade,
  name text not null,
  file_uri text not null,
  size numeric,
  read_status text not null default 'aguardando' check (read_status in ('aguardando','lido','parcial','nao_lido')),
  read_note text default '',
  created_by_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now()
);

create table public.case_entries (
  id text primary key default public.new_id(),
  case_id text not null references public.consulting_cases(id) on delete cascade,
  kind text not null check (kind in ('parecer','pergunta','resposta','nota','correcao','decisao','controle')),
  content text not null,
  justification text,
  reference_id text,
  created_by_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now()
);

create index on public.consulting_cases (created_by_id, created_date desc);
create index on public.case_documents (case_id, created_date desc);
create index on public.case_entries (case_id, created_date);
create index on public.case_entries (case_id, kind, created_date desc);

create trigger touch_cases before update on public.consulting_cases for each row execute function public.touch_updated_date();
create trigger touch_docs before update on public.case_documents for each row execute function public.touch_updated_date();
create trigger touch_entries before update on public.case_entries for each row execute function public.touch_updated_date();

alter table public.profiles enable row level security;
alter table public.consulting_cases enable row level security;
alter table public.case_documents enable row level security;
alter table public.case_entries enable row level security;

create policy "profiles self read" on public.profiles for select to authenticated using (id = (select auth.uid()) or (select public.is_admin()));
create policy "profiles self update name" on public.profiles for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()) and role = (select p.role from public.profiles p where p.id = (select auth.uid())));

create policy "cases read" on public.consulting_cases for select to authenticated using (created_by_id = (select auth.uid()) or (select public.is_admin()));
create policy "cases insert" on public.consulting_cases for insert to authenticated with check (created_by_id = (select auth.uid()));
create policy "cases update" on public.consulting_cases for update to authenticated using (created_by_id = (select auth.uid()) or (select public.is_admin()));
create policy "cases delete" on public.consulting_cases for delete to authenticated using (created_by_id = (select auth.uid()) or (select public.is_admin()));

create policy "docs own" on public.case_documents for all to authenticated
  using (created_by_id = (select auth.uid()))
  with check (created_by_id = (select auth.uid()) and exists (select 1 from public.consulting_cases c where c.id = case_id and c.created_by_id = (select auth.uid())));

create policy "entries own" on public.case_entries for all to authenticated
  using (created_by_id = (select auth.uid()))
  with check (created_by_id = (select auth.uid()) and exists (select 1 from public.consulting_cases c where c.id = case_id and c.created_by_id = (select auth.uid())));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('case-files', 'case-files', false, 8388608,
  array['application/pdf','application/vnd.openxmlformats-officedocument.wordprocessingml.document','text/plain']);

create policy "case files own read" on storage.objects for select to authenticated
  using (bucket_id = 'case-files' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "case files own insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'case-files' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "case files own delete" on storage.objects for delete to authenticated
  using (bucket_id = 'case-files' and (storage.foldername(name))[1] = (select auth.uid())::text);
