
grant execute on function public.has_role(uuid, public.app_role) to authenticated;

drop policy "products public read" on public.products;
create policy "products public read active" on public.products for select to anon, authenticated using (is_active);
create policy "products admin read all" on public.products for select to authenticated using (public.has_role(auth.uid(),'admin'));

drop policy "banners public read" on public.banners;
create policy "banners public read active" on public.banners for select to anon, authenticated using (is_active);
create policy "banners admin read all" on public.banners for select to authenticated using (public.has_role(auth.uid(),'admin'));
