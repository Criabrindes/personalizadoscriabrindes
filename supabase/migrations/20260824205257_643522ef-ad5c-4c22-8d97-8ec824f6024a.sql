
create type public.app_role as enum ('admin');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  role app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create policy "own roles readable" on public.user_roles for select to authenticated using (user_id = auth.uid());

create or replace function public.claim_admin()
returns boolean language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then return false; end if;
  if exists (select 1 from public.user_roles where role = 'admin') then
    return public.has_role(auth.uid(), 'admin');
  end if;
  insert into public.user_roles (user_id, role) values (auth.uid(), 'admin')
  on conflict do nothing;
  return true;
end;
$$;
grant execute on function public.claim_admin() to authenticated;

create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end; $$;

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
grant select on public.categories to anon, authenticated;
grant insert, update, delete on public.categories to authenticated;
grant all on public.categories to service_role;
alter table public.categories enable row level security;
create policy "categories public read" on public.categories for select to anon, authenticated using (true);
create policy "categories admin write" on public.categories for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create table public.products (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  description text not null default '',
  price numeric(10,2) not null default 0,
  sale_price numeric(10,2),
  category_id uuid references public.categories(id) on delete set null,
  images text[] not null default '{}',
  variations jsonb not null default '[]'::jsonb,
  is_offer boolean not null default false,
  is_bestseller boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.products to anon, authenticated;
grant insert, update, delete on public.products to authenticated;
grant all on public.products to service_role;
alter table public.products enable row level security;
create policy "products public read" on public.products for select to anon, authenticated using (is_active or public.has_role(auth.uid(),'admin'));
create policy "products admin write" on public.products for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create trigger products_updated before update on public.products for each row execute function public.set_updated_at();

create table public.banners (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subtitle text not null default '',
  image_url text,
  link_url text,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
grant select on public.banners to anon, authenticated;
grant insert, update, delete on public.banners to authenticated;
grant all on public.banners to service_role;
alter table public.banners enable row level security;
create policy "banners public read" on public.banners for select to anon, authenticated using (is_active or public.has_role(auth.uid(),'admin'));
create policy "banners admin write" on public.banners for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number bigint generated always as identity,
  customer_name text not null,
  customer_phone text not null,
  customer_address text,
  customer_cpf text,
  payment_method text not null,
  delivery_method text not null,
  items jsonb not null default '[]'::jsonb,
  total numeric(10,2) not null default 0,
  notes text,
  status text not null default 'novo',
  created_at timestamptz not null default now()
);
grant insert on public.orders to anon, authenticated;
grant select, update, delete on public.orders to authenticated;
grant all on public.orders to service_role;
alter table public.orders enable row level security;
create policy "orders anyone can create" on public.orders for insert to anon, authenticated with check (true);
create policy "orders admin read" on public.orders for select to authenticated using (public.has_role(auth.uid(),'admin'));
create policy "orders admin update" on public.orders for update to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create policy "orders admin delete" on public.orders for delete to authenticated using (public.has_role(auth.uid(),'admin'));

create policy "product images public read" on storage.objects for select to anon, authenticated using (bucket_id = 'product-images');
create policy "product images admin write" on storage.objects for insert to authenticated with check (bucket_id = 'product-images' and public.has_role(auth.uid(),'admin'));
create policy "product images admin delete" on storage.objects for delete to authenticated using (bucket_id = 'product-images' and public.has_role(auth.uid(),'admin'));

insert into public.categories (name, slug, sort_order) values
  ('Canecas','canecas',1),
  ('Papelaria Personalizada','papelaria',2),
  ('Brindes Corporativos','brindes-corporativos',3);

insert into public.banners (title, subtitle, sort_order) values
  ('Presentes que emocionam','Canecas, papelaria e brindes personalizados do seu jeito',1),
  ('Kits corporativos sob encomenda','Fortaleça sua marca com brindes exclusivos',2);

insert into public.products (code, name, description, price, sale_price, category_id, variations, is_offer, is_bestseller)
select 'CAN-001','Caneca Personalizada 325ml','Caneca de cerâmica branca com impressão colorida personalizada. Ideal para presentear.',39.90,29.90,c.id,'[{"name":"Cor da alça","options":["Branca","Preta","Vermelha"]},{"name":"Tipo de personalização","options":["Foto","Nome","Logo"]}]'::jsonb,true,true from public.categories c where c.slug='canecas';
insert into public.products (code, name, description, price, category_id, variations, is_bestseller)
select 'CAN-002','Caneca Mágica Térmica','Revela a arte personalizada ao receber líquido quente.',54.90,c.id,'[{"name":"Tipo de personalização","options":["Foto","Frase"]}]'::jsonb,true from public.categories c where c.slug='canecas';
insert into public.products (code, name, description, price, sale_price, category_id, variations, is_offer)
select 'PAP-001','Kit Papelaria Personalizada','Caderno, canetas e adesivos com nome e arte à sua escolha.',89.90,74.90,c.id,'[{"name":"Tamanho","options":["A5","A4"]}]'::jsonb,true from public.categories c where c.slug='papelaria';
insert into public.products (code, name, description, price, category_id, variations)
select 'PAP-002','Planner Personalizado 2026','Planner com capa dura personalizada e páginas exclusivas.',119.90,c.id,'[{"name":"Cor da capa","options":["Roxo","Rosa","Preto"]}]'::jsonb from public.categories c where c.slug='papelaria';
insert into public.products (code, name, description, price, category_id, variations, is_bestseller)
select 'BRI-001','Kit Brinde Corporativo Executivo','Caneta, bloco e ecobag com o logo da sua empresa. Pedido mínimo de 20 unidades.',64.90,c.id,'[{"name":"Cor","options":["Preto","Azul","Roxo"]}]'::jsonb,true from public.categories c where c.slug='brindes-corporativos';
insert into public.products (code, name, description, price, sale_price, category_id, variations, is_offer)
select 'BRI-002','Garrafa Térmica Personalizada','Garrafa inox 500ml com gravação a laser do seu logo.',79.90,69.90,c.id,'[{"name":"Cor","options":["Prata","Preto","Branco"]}]'::jsonb,true from public.categories c where c.slug='brindes-corporativos';
