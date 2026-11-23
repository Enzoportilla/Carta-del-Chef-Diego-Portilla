-- Carta Chef Diego Portilla: productos, permisos (RLS), fotos y semilla.
-- Ejecutar completo en Supabase → SQL Editor. Se puede volver a correr sin duplicar datos.

create table if not exists public.productos (
  id          text primary key,
  categoria   text not null check (categoria in ('panes', 'sopaipillas', 'dulces', 'salados')), -- ver src/data.js
  nombre      text not null,
  formato     text,                                             -- qué trae el pack, p. ej. '5 unidades de 70 g'
  precio_clp  integer check (precio_clp > 0),                   -- precio del pack; null = falta definirlo
  stock       integer not null default 0 check (stock >= 0),    -- en packs
  descripcion text,
  foto        text,                                             -- ruta en el bucket 'fotos'
  orden       integer not null default 0,
  activo      boolean not null default false,
  constraint visible_con_precio check (not activo or precio_clp is not null)
);

-- El rol vive en app_metadata, que el propio usuario no puede editar.
create or replace function public.es_admin() returns boolean
language sql stable set search_path = '' as $$
  select coalesce(auth.jwt() -> 'app_metadata' ->> 'rol' = 'admin', false)
$$;

alter table public.productos enable row level security;

drop policy if exists "publico ve activos" on public.productos;
drop policy if exists "admin lee todo" on public.productos;
drop policy if exists "admin actualiza" on public.productos;
drop policy if exists "admin agrega" on public.productos;

create policy "publico ve activos" on public.productos
  for select to anon, authenticated using (activo);
create policy "admin lee todo" on public.productos
  for select to authenticated using (public.es_admin());
create policy "admin actualiza" on public.productos
  for update to authenticated using (public.es_admin()) with check (public.es_admin());

create policy "admin agrega" on public.productos
  for insert to authenticated with check (public.es_admin());

revoke all on public.productos from anon, authenticated;
grant select on public.productos to anon, authenticated;
grant insert, update on public.productos to authenticated;

-- Fotos: lectura pública por URL; solo el admin sube y borra.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('fotos', 'fotos', true, 2097152, array['image/jpeg'])
on conflict (id) do update set public = excluded.public,
  file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "admin lee fotos" on storage.objects;
drop policy if exists "admin sube fotos" on storage.objects;
drop policy if exists "admin borra fotos" on storage.objects;

create policy "admin lee fotos" on storage.objects
  for select to authenticated using (bucket_id = 'fotos' and public.es_admin());
create policy "admin sube fotos" on storage.objects
  for insert to authenticated with check (bucket_id = 'fotos' and public.es_admin());
create policy "admin borra fotos" on storage.objects
  for delete to authenticated using (bucket_id = 'fotos' and public.es_admin());

-- Semilla. El stock 10 es de ejemplo: ajustarlo en #/admin. Sin precio = oculto.
insert into public.productos (id, categoria, nombre, formato, precio_clp, stock, orden, activo) values
  ('fugazza',            'panes',       'Fugazza',            '5 unidades de 50 g',     2000, 10, 10,  true),
  ('pan-arabe',          'panes',       'Pan árabe',          '5 unidades de 70 g',     2000, 10, 20,  true),
  ('pan-amasado',        'panes',       'Pan amasado',        '5 unidades de 80 g',     2000, 10, 30,  true),
  ('pan-integral',       'panes',       'Pan integral',       '5 unidades de 80 g',     3000, 10, 40,  true),
  ('roscas',             'panes',       'Roscas',             '4 unidades de 65–70 g',  2000, 10, 50,  true),
  ('pan-de-naranjas',    'panes',       'Pan de naranjas',    '2 unidades de 50 g',     1000, 10, 60,  true),
  ('dobladas',           'panes',       'Dobladas',           '5 unidades de 80 g',     2000, 10, 70,  true),
  ('doblada-con-queso',  'panes',       'Doblada con queso',  '4 unidades de 80 g',     2500, 10, 80,  true),
  ('pan-con-chicharron', 'panes',       'Pan con chicharrón', '4 unidades de 75–80 g',  2500, 10, 90,  true),
  ('sopaipilla-seca',    'sopaipillas', 'Sopaipilla seca',    '1 unidad de 12 cm',      400,  10, 100, true),
  ('sopaipilla-pasada',  'sopaipillas', 'Sopaipilla pasada',  '2 unidades de 10 cm',    1000, 10, 110, true),
  ('calzon-roto',        'sopaipillas', 'Calzón roto',        '3 unidades de 15 cm',    1000, 10, 120, true),
  ('torta-hojarasca',    'dulces',      'Torta hojarasca',    '1 unidad de 10 cm',      2500, 10, 130, true),
  ('mini-chileno',       'dulces',      'Mini chileno',       '4 unidades',             2000, 10, 140, true),
  ('rollos-canela',      'dulces',      'Rollos de canela',   '4 unidades',             2000, 10, 150, true),
  ('dona-rellena',       'dulces',      'Dona rellena',       '65 g',                   null, 0,  160, false),
  ('empolvados',         'dulces',      'Empolvados',         '30 g, con manjar',       null, 0,  170, false),
  ('falafel',            'salados',     'Falafel',            '4 unidades de 25 g',     null, 0,  180, false),
  ('masa-empanada',      'salados',     'Masa de empanada',   '130 g',                  null, 0,  190, false),
  ('empanada-queso',     'salados',     'Empanada de queso',  'Con 58 g de queso',      null, 0,  200, false)
on conflict (id) do nothing;
