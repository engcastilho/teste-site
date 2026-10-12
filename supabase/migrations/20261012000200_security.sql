-- =============================================================================
-- Segurança: Row Level Security, privilégios e storage.
-- Visitantes (anon) só leem conteúdo publicado. Somente usuários presentes em
-- public.admin_users podem criar, alterar ou excluir.
-- =============================================================================

alter table public.admin_users enable row level security;
alter table public.news enable row level security;
alter table public.resources enable row level security;
alter table public.news_resources enable row level security;
alter table public.pages enable row level security;
alter table public.site_settings enable row level security;
alter table public.media enable row level security;

-- Privilégios mínimos por papel (o RLS restringe ainda mais as linhas).
revoke all on all tables in schema public from anon, authenticated;

grant select on public.news, public.resources, public.news_resources,
  public.pages, public.site_settings to anon;

grant select, insert, update, delete on public.news, public.resources,
  public.news_resources, public.media to authenticated;
grant select, insert, update on public.pages, public.site_settings to authenticated;
grant select on public.admin_users to authenticated;

-- ---------------------------------------------------------------- admin_users
create policy "Usuário vê o próprio registro de administrador"
  on public.admin_users for select to authenticated
  using (user_id = (select auth.uid()));

-- ----------------------------------------------------------------------- news
create policy "Leitura de notícias publicadas ou pelo administrador"
  on public.news for select to anon, authenticated
  using (status = 'published' or (select public.is_admin()));

create policy "Administrador cria notícias"
  on public.news for insert to authenticated
  with check ((select public.is_admin()));

create policy "Administrador altera notícias"
  on public.news for update to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "Administrador exclui notícias"
  on public.news for delete to authenticated
  using ((select public.is_admin()));

-- ------------------------------------------------------------------ resources
create policy "Leitura de recursos publicados ou pelo administrador"
  on public.resources for select to anon, authenticated
  using (is_published or (select public.is_admin()));

create policy "Administrador cria recursos"
  on public.resources for insert to authenticated
  with check ((select public.is_admin()));

create policy "Administrador altera recursos"
  on public.resources for update to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "Administrador exclui recursos"
  on public.resources for delete to authenticated
  using ((select public.is_admin()));

-- ------------------------------------------------------------- news_resources
-- O vínculo só é público quando a notícia e o recurso estão publicados.
create policy "Leitura de vínculos públicos ou pelo administrador"
  on public.news_resources for select to anon, authenticated
  using (
    (select public.is_admin())
    or (
      exists (select 1 from public.news n
              where n.id = news_id and n.status = 'published')
      and exists (select 1 from public.resources r
                  where r.id = resource_id and r.is_published)
    )
  );

create policy "Administrador cria vínculos"
  on public.news_resources for insert to authenticated
  with check ((select public.is_admin()));

create policy "Administrador remove vínculos"
  on public.news_resources for delete to authenticated
  using ((select public.is_admin()));

-- ---------------------------------------------------------------------- pages
create policy "Páginas institucionais são públicas"
  on public.pages for select to anon, authenticated
  using (true);

create policy "Administrador cria páginas"
  on public.pages for insert to authenticated
  with check ((select public.is_admin()));

create policy "Administrador altera páginas"
  on public.pages for update to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- -------------------------------------------------------------- site_settings
create policy "Configurações do site são públicas"
  on public.site_settings for select to anon, authenticated
  using (true);

create policy "Administrador cria configurações"
  on public.site_settings for insert to authenticated
  with check ((select public.is_admin()));

create policy "Administrador altera configurações"
  on public.site_settings for update to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- ---------------------------------------------------------------------- media
create policy "Administrador lê a biblioteca de imagens"
  on public.media for select to authenticated
  using ((select public.is_admin()));

create policy "Administrador registra imagens"
  on public.media for insert to authenticated
  with check ((select public.is_admin()));

create policy "Administrador altera imagens"
  on public.media for update to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "Administrador exclui imagens"
  on public.media for delete to authenticated
  using ((select public.is_admin()));

-- ==================================================================== storage
-- Bucket público para leitura (as imagens aparecem no site), com escrita
-- restrita a administradores. SVG não é aceito para evitar scripts embutidos.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'media', 'media', true, 5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "Administrador lista arquivos de mídia"
  on storage.objects for select to authenticated
  using (bucket_id = 'media' and (select public.is_admin()));

create policy "Administrador envia arquivos de mídia"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'media' and (select public.is_admin()));

create policy "Administrador altera arquivos de mídia"
  on storage.objects for update to authenticated
  using (bucket_id = 'media' and (select public.is_admin()))
  with check (bucket_id = 'media' and (select public.is_admin()));

create policy "Administrador exclui arquivos de mídia"
  on storage.objects for delete to authenticated
  using (bucket_id = 'media' and (select public.is_admin()));
