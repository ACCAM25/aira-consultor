create or replace function public.storage_project_lead(folder text) returns boolean language plpgsql stable security definer set search_path = '' as $$
begin
  return exists (select 1 from public.project_members where project_id = folder::uuid and user_id = (select auth.uid()) and role = 'lider');
exception when others then
  return false;
end $$;
revoke execute on function public.storage_project_lead(text) from public, anon;
grant execute on function public.storage_project_lead(text) to authenticated;
create policy "project files delete by lead" on storage.objects for delete to authenticated
  using (bucket_id = 'project-files' and (select public.storage_project_lead((storage.foldername(name))[1])));
