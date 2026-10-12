-- =============================================================================
-- Estrutura principal: notícias, recursos, vínculos, páginas, configurações,
-- mídia e administradores.
-- =============================================================================

create type public.news_status as enum ('draft', 'published');

-- Etapas de um recurso. A ordem importa: cada etapa é um avanço sobre a anterior.
create type public.resource_status as enum (
  'solicitado',  -- pedido formalizado, sem garantia de liberação
  'anunciado',   -- anunciado pelo órgão concedente, ainda sem empenho
  'empenhado',   -- valor reservado no orçamento (nota de empenho)
  'pago',        -- valor transferido / pago
  'executado'    -- obra, compra ou serviço efetivamente realizado
);

-- -----------------------------------------------------------------------------
-- Função utilitária para manter updated_at
-- -----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- -----------------------------------------------------------------------------
-- Administradores
-- Só é possível inserir registros aqui pelo SQL Editor do Supabase ou com a
-- chave service_role (script scripts/create-admin.mjs). Não há política de
-- escrita para usuários comuns.
-- -----------------------------------------------------------------------------
create table public.admin_users (
  user_id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.admin_users where user_id = (select auth.uid())
  );
$$;

revoke execute on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- -----------------------------------------------------------------------------
-- Notícias
-- -----------------------------------------------------------------------------
create table public.news (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique
    check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) <= 120),
  title text not null check (char_length(title) between 3 and 200),
  excerpt text not null default '' check (char_length(excerpt) <= 400),
  content text not null default '',
  category text not null default 'Notícias' check (char_length(category) <= 60),
  cover_image_url text,
  cover_image_alt text,
  status public.news_status not null default 'draft',
  published_at timestamptz,
  created_by uuid default auth.uid() references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index news_status_published_at_idx on public.news (status, published_at desc);
create index news_category_idx on public.news (category);

create trigger news_set_updated_at
  before update on public.news
  for each row execute function public.set_updated_at();

-- Define a data de publicação automaticamente na primeira publicação.
create or replace function public.news_set_published_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.status = 'published' and new.published_at is null then
    new.published_at = now();
  end if;
  return new;
end;
$$;

create trigger news_set_published_at
  before insert or update on public.news
  for each row execute function public.news_set_published_at();

-- -----------------------------------------------------------------------------
-- Recursos destinados ao município
-- -----------------------------------------------------------------------------
create table public.resources (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique
    check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) <= 120),
  title text not null check (char_length(title) between 3 and 200),
  amount numeric(14, 2) check (amount is null or amount >= 0),
  description text not null default '',
  purpose text not null default '',
  location text not null default '',
  origin text not null default '',
  status public.resource_status not null default 'solicitado',
  reference_date date,
  photos text[] not null default '{}',
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index resources_published_idx on public.resources (is_published, reference_date desc);

create trigger resources_set_updated_at
  before update on public.resources
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- Vínculo N:N entre notícias e recursos
-- -----------------------------------------------------------------------------
create table public.news_resources (
  news_id uuid not null references public.news (id) on delete cascade,
  resource_id uuid not null references public.resources (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (news_id, resource_id)
);

create index news_resources_resource_idx on public.news_resources (resource_id);

-- -----------------------------------------------------------------------------
-- Páginas institucionais editáveis
-- -----------------------------------------------------------------------------
create table public.pages (
  slug text primary key check (slug in ('sobre', 'contato')),
  title text not null,
  subtitle text not null default '',
  content text not null default '',
  image_url text,
  image_alt text,
  updated_at timestamptz not null default now()
);

create trigger pages_set_updated_at
  before update on public.pages
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- Configurações do site (linha única)
-- -----------------------------------------------------------------------------
create table public.site_settings (
  id smallint primary key default 1 check (id = 1),
  site_name text not null default 'Vereador',
  site_description text not null default '',
  primary_color text not null default '#1d4ed8' check (primary_color ~ '^#[0-9a-fA-F]{6}$'),
  secondary_color text not null default '#f59e0b' check (secondary_color ~ '^#[0-9a-fA-F]{6}$'),
  logo_url text,
  hero_image_url text,
  hero_eyebrow text not null default '',
  hero_title text not null default '',
  hero_subtitle text not null default '',
  about_title text not null default '',
  about_text text not null default '',
  contact_email text not null default '',
  contact_phone text not null default '',
  whatsapp text not null default '',
  address text not null default '',
  office_hours text not null default '',
  instagram_url text not null default '',
  facebook_url text not null default '',
  youtube_url text not null default '',
  tiktok_url text not null default '',
  home_sections jsonb not null default '[
    {"key": "news", "enabled": true},
    {"key": "resources", "enabled": true},
    {"key": "projects", "enabled": true},
    {"key": "about", "enabled": true},
    {"key": "contact", "enabled": true}
  ]'::jsonb check (jsonb_typeof(home_sections) = 'array'),
  updated_at timestamptz not null default now()
);

create trigger site_settings_set_updated_at
  before update on public.site_settings
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- Biblioteca de imagens (metadados dos arquivos do bucket "media")
-- -----------------------------------------------------------------------------
create table public.media (
  id uuid primary key default gen_random_uuid(),
  storage_path text not null unique,
  url text not null,
  file_name text not null default '',
  mime_type text not null default '',
  size_bytes integer not null default 0,
  alt text not null default '',
  created_by uuid default auth.uid() references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create index media_created_at_idx on public.media (created_at desc);
