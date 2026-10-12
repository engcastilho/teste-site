-- =============================================================================
-- Conteúdo inicial. Tudo marcado como EXEMPLO é fictício e deve ser substituído
-- ou excluído pelo painel administrativo antes da divulgação do site.
-- =============================================================================

insert into public.site_settings (
  id, site_name, site_description, hero_eyebrow, hero_title, hero_subtitle,
  about_title, about_text, office_hours
) values (
  1,
  'Vereador Negão Monteiro',
  'Site institucional do vereador Negão Monteiro, de Alta Floresta D''Oeste (RO). Notícias, recursos destinados ao município e canais de contato.',
  'Alta Floresta D''Oeste · Rondônia',
  'Trabalho sério e transparente por Alta Floresta D''Oeste',
  'TEXTO DE EXEMPLO — substitua esta mensagem de apresentação no painel administrativo, em Configurações.',
  'Quem é Negão Monteiro',
  'TEXTO DE EXEMPLO — escreva aqui uma breve apresentação do vereador. Este texto aparece na página inicial e pode ser alterado em Configurações.',
  'Segunda a sexta, das 7h30 às 13h30 (EXEMPLO)'
)
on conflict (id) do nothing;

insert into public.pages (slug, title, subtitle, content) values
(
  'sobre',
  'Sobre o vereador',
  'Trajetória e atuação parlamentar',
  '<p><strong>CONTEÚDO DE EXEMPLO.</strong> Substitua este texto pela biografia real do vereador em <em>Painel › Páginas</em>.</p><h2>Trajetória</h2><p>Descreva aqui a história, a formação e a ligação do vereador com o município.</p><h2>Atuação parlamentar</h2><p>Liste as comissões, as áreas de atuação e as principais pautas defendidas na Câmara Municipal.</p>'
),
(
  'contato',
  'Fale com o gabinete',
  'Canais oficiais de atendimento',
  '<p><strong>CONTEÚDO DE EXEMPLO.</strong> Explique aqui como o cidadão pode solicitar atendimento, enviar sugestões ou agendar uma visita ao gabinete.</p>'
)
on conflict (slug) do nothing;

-- Notícias e recursos de exemplo -------------------------------------------------
with r as (
  insert into public.resources (
    slug, title, amount, description, purpose, location, origin, status,
    reference_date, is_published
  ) values (
    'exemplo-equipamentos-para-saude',
    'EXEMPLO — Recurso para aquisição de equipamentos de saúde',
    200000.00,
    'Registro fictício criado para demonstrar o funcionamento do site. Exclua ou edite no painel.',
    'Aquisição de equipamentos para unidades básicas de saúde (exemplo).',
    'Sede do município (exemplo)',
    'Emenda parlamentar (exemplo)',
    'anunciado',
    date '2026-01-15',
    true
  )
  returning id
),
n as (
  insert into public.news (
    slug, title, excerpt, content, category, status, published_at
  ) values (
    'exemplo-municipio-recebe-investimento-para-saude',
    'EXEMPLO — Município recebe investimento para melhoria da saúde',
    'Notícia fictícia que demonstra o vínculo entre notícias e recursos. Substitua por conteúdo real.',
    '<p><strong>Esta é uma notícia de exemplo.</strong> Ela existe apenas para mostrar como uma notícia aparece no site e como um recurso vinculado é exibido logo abaixo do texto.</p><p>Edite ou exclua esta notícia em <em>Painel › Notícias</em>.</p>',
    'Saúde',
    'published',
    timestamptz '2026-01-16 12:00:00-04'
  )
  returning id
)
insert into public.news_resources (news_id, resource_id)
select n.id, r.id from n, r;

insert into public.news (slug, title, excerpt, content, category, status, published_at) values
(
  'exemplo-projeto-de-lei-apresentado',
  'EXEMPLO — Projeto de lei apresentado na Câmara',
  'Notícia fictícia na categoria Projetos. Ela aparece na seção “Projetos e realizações” da página inicial.',
  '<p><strong>Esta é uma notícia de exemplo</strong> cadastrada na categoria <em>Projetos</em>. Notícias das categorias Projetos e Realizações aparecem na seção “Projetos e realizações” da página inicial.</p>',
  'Projetos',
  'published',
  timestamptz '2026-01-10 12:00:00-04'
),
(
  'exemplo-rascunho-nao-publicado',
  'EXEMPLO — Rascunho que não aparece no site',
  'Este rascunho só é visível no painel administrativo.',
  '<p>Rascunhos não são exibidos ao público. Use a pré-visualização para conferir antes de publicar.</p>',
  'Notícias',
  'draft',
  null
);

insert into public.resources (
  slug, title, amount, description, purpose, location, origin, status,
  reference_date, is_published
) values (
  'exemplo-pavimentacao-solicitada',
  'EXEMPLO — Pedido de recurso para pavimentação',
  null,
  'Registro fictício de um recurso apenas solicitado. Sem valor confirmado.',
  'Pavimentação de vias urbanas (exemplo).',
  'Bairro de exemplo',
  'Pedido ao Governo do Estado (exemplo)',
  'solicitado',
  date '2026-02-01',
  true
);
