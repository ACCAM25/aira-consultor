-- Projetos AIra (cânone 3.0)
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(name) between 1 and 200),
  client_name text not null check (length(client_name) between 1 and 200),
  sector text not null check (sector in ('publico','privado')),
  status text not null default 'configuracao' check (status in ('configuracao','em_andamento','pausado','encerrado')),
  current_phase text not null default 'F0' check (current_phase in ('F0','F1','F2','F3','F4','F5','F6','ENC')),
  executive_question text,
  start_date date,
  end_date date,
  config jsonb not null default '{}'::jsonb,
  phase_checks jsonb not null default '{}'::jsonb,
  closing jsonb not null default '{}'::jsonb,
  canon_version text not null default '3.0',
  canon_hash text,
  created_by uuid not null default auth.uid() references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.project_members (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  email text not null,
  role text not null check (role in ('lider','consultor','revisor','cliente')),
  created_at timestamptz not null default now(),
  unique (project_id, email)
);
create index on public.project_members (user_id);
create index on public.project_members (project_id);

create table public.records (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  kind text not null check (kind in ('evidencia','gap','decisao','pendencia','gate','mudanca','encaminhamento','papel','instrumento','entregavel','nota')),
  code text,
  title text not null check (length(title) between 1 and 500),
  status text,
  phase text,
  module text,
  data jsonb not null default '{}'::jsonb,
  archived boolean not null default false,
  created_by uuid not null default auth.uid() references auth.users(id),
  updated_by uuid default auth.uid() references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on public.records (project_id, kind, created_at);

-- Histórico imutável de cada registro (rastreabilidade exigida pelo cânone)
create table public.record_history (
  id bigint generated always as identity primary key,
  record_id uuid not null,
  project_id uuid not null references public.projects(id) on delete cascade,
  action text not null,
  snapshot jsonb not null,
  changed_by uuid,
  changed_at timestamptz not null default now()
);
create index on public.record_history (project_id, changed_at desc);
create index on public.record_history (record_id);

-- Funções de acesso
create or replace function public.project_role(pid uuid) returns text language sql stable security definer set search_path = '' as $$
  select role from public.project_members where project_id = pid and user_id = (select auth.uid()) limit 1
$$;
create or replace function public.is_project_member(pid uuid) returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.project_members where project_id = pid and user_id = (select auth.uid()))
$$;
create or replace function public.can_edit_project(pid uuid) returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.project_members where project_id = pid and user_id = (select auth.uid()) and role in ('lider','consultor','revisor'))
$$;
create or replace function public.is_project_lead(pid uuid) returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.project_members where project_id = pid and user_id = (select auth.uid()) and role = 'lider')
$$;
create or replace function public.storage_project_member(folder text) returns boolean language plpgsql stable security definer set search_path = '' as $$
begin
  return exists (select 1 from public.project_members where project_id = folder::uuid and user_id = (select auth.uid()));
exception when others then
  return false;
end $$;

-- Gatilhos
create or replace function public.touch_updated_at() returns trigger language plpgsql set search_path = '' as $$
begin new.updated_at = now(); return new; end $$;
create trigger touch_projects before update on public.projects for each row execute function public.touch_updated_at();

create or replace function public.add_creator_as_lead() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.project_members (project_id, user_id, email, role)
  select new.id, new.created_by, u.email, 'lider' from auth.users u where u.id = new.created_by;
  return new;
end $$;
create trigger projects_add_lead after insert on public.projects for each row execute function public.add_creator_as_lead();

create or replace function public.link_member_user() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  new.email = lower(trim(new.email));
  if new.user_id is null then
    select id into new.user_id from auth.users where lower(email) = new.email limit 1;
  end if;
  return new;
end $$;
create trigger members_link_user before insert or update of email on public.project_members for each row execute function public.link_member_user();

create or replace function public.prepare_record() returns trigger language plpgsql security definer set search_path = '' as $$
declare prefix text; n int;
begin
  new.updated_at = now();
  new.updated_by = (select auth.uid());
  if tg_op = 'INSERT' and new.code is null then
    prefix := case new.kind when 'evidencia' then 'EV' when 'gap' then 'GAP' when 'decisao' then 'DEC' when 'pendencia' then 'PEN'
      when 'gate' then 'GT' when 'mudanca' then 'MUD' when 'encaminhamento' then 'ENC' when 'papel' then 'PAP'
      when 'instrumento' then 'INS' when 'entregavel' then 'ENT' else 'NOT' end;
    select count(*) + 1 into n from public.records where project_id = new.project_id and kind = new.kind;
    new.code := prefix || '-' || lpad(n::text, 3, '0');
  end if;
  return new;
end $$;
create trigger records_prepare before insert or update on public.records for each row execute function public.prepare_record();

create or replace function public.log_record_history() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.record_history (record_id, project_id, action, snapshot, changed_by)
  values (new.id, new.project_id, lower(tg_op), to_jsonb(new), (select auth.uid()));
  return new;
end $$;
create trigger records_history after insert or update on public.records for each row execute function public.log_record_history();

-- Vincula convites pendentes quando a pessoa cria a conta
create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'))
  on conflict (id) do nothing;
  update public.project_members set user_id = new.id where user_id is null and email = lower(new.email);
  return new;
end $$;

-- RLS
alter table public.projects enable row level security;
alter table public.project_members enable row level security;
alter table public.records enable row level security;
alter table public.record_history enable row level security;

create policy "projects read" on public.projects for select to authenticated using ((select public.is_project_member(id)) or created_by = (select auth.uid()));
create policy "projects create" on public.projects for insert to authenticated with check (created_by = (select auth.uid()));
create policy "projects edit" on public.projects for update to authenticated using ((select public.can_edit_project(id))) with check ((select public.can_edit_project(id)));
create policy "projects delete" on public.projects for delete to authenticated using ((select public.is_project_lead(id)));

create policy "members read" on public.project_members for select to authenticated using ((select public.is_project_member(project_id)));
create policy "members add" on public.project_members for insert to authenticated with check ((select public.is_project_lead(project_id)));
create policy "members edit" on public.project_members for update to authenticated using ((select public.is_project_lead(project_id)));
create policy "members remove" on public.project_members for delete to authenticated using ((select public.is_project_lead(project_id)) and user_id is distinct from (select auth.uid()));

create policy "records read" on public.records for select to authenticated using ((select public.is_project_member(project_id)));
create policy "records create" on public.records for insert to authenticated with check ((select public.can_edit_project(project_id)) and created_by = (select auth.uid()));
create policy "records edit" on public.records for update to authenticated using ((select public.can_edit_project(project_id))) with check ((select public.can_edit_project(project_id)));

create policy "history read" on public.record_history for select to authenticated using ((select public.is_project_member(project_id)));

-- Arquivos por projeto
insert into storage.buckets (id, name, public, file_size_limit)
values ('project-files', 'project-files', false, 20971520);
create policy "project files read" on storage.objects for select to authenticated
  using (bucket_id = 'project-files' and (select public.storage_project_member((storage.foldername(name))[1])));
create policy "project files upload" on storage.objects for insert to authenticated
  with check (bucket_id = 'project-files' and (select public.storage_project_member((storage.foldername(name))[1])));

-- Grants
revoke execute on function public.project_role(uuid), public.is_project_member(uuid), public.can_edit_project(uuid), public.is_project_lead(uuid), public.storage_project_member(text) from public, anon;
grant execute on function public.project_role(uuid), public.is_project_member(uuid), public.can_edit_project(uuid), public.is_project_lead(uuid), public.storage_project_member(text) to authenticated;
revoke execute on function public.add_creator_as_lead(), public.link_member_user(), public.prepare_record(), public.log_record_history(), public.handle_new_user(), public.touch_updated_at() from public, anon, authenticated;
