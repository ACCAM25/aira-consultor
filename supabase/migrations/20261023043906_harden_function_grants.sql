revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;
revoke execute on function public.new_id() from public, anon;
grant execute on function public.new_id() to authenticated, service_role;
