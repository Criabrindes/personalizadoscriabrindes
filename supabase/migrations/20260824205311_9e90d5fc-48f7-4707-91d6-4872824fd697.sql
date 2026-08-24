
revoke all on function public.has_role(uuid, public.app_role) from public, anon, authenticated;
grant execute on function public.has_role(uuid, public.app_role) to service_role;
revoke all on function public.claim_admin() from public, anon;
grant execute on function public.claim_admin() to authenticated;
revoke all on function public.set_updated_at() from public, anon, authenticated;
