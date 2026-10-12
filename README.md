# Site institucional — Vereador Negão Monteiro

Site público + painel administrativo privado para o vereador Negão Monteiro
(Alta Floresta D'Oeste – RO). MVP funcional: o conteúdo fica no banco de dados
(Supabase) e é publicado pelo painel, sem precisar de novo deploy.

> Todo conteúdo marcado como **EXEMPLO** é fictício (inclusive valores de
> recursos). Edite ou exclua pelo painel antes de divulgar o site. Nenhuma
> fotografia foi incluída: os espaços de foto mostram um aviso até você enviar
> as imagens reais.

## Tecnologias

- **Next.js 16** (App Router, Cache Components, Server Actions) + **TypeScript**
- **Tailwind CSS v4** + componentes no padrão **shadcn/ui** (Radix UI)
- **Supabase**: Postgres, Auth, Storage e Row Level Security
- **TipTap** (editor de texto rico) e **sanitize-html** (limpeza do HTML)
- Hospedagem: **Vercel**

## Estrutura

```
src/
  app/
    (site)/            site público: /, /noticias, /noticias/[slug], /recursos,
                       /recursos/[slug], /sobre, /contato
    admin/login        tela de login
    admin/(panel)/     painel: dashboard, notícias, recursos, páginas,
                       imagens, configurações
    sitemap.ts, robots.ts
  actions/             Server Actions (todas as gravações)
  components/
    ui/                componentes base (padrão shadcn/ui)
    site/              componentes do site público
    admin/             formulários, editor, upload, menus do painel
  lib/
    data/public.ts     leituras públicas com cache ("use cache" + tag)
    data/admin.ts      leituras do painel (sem cache, com a sessão do admin)
    supabase/          clientes do Supabase (servidor, navegador, público, proxy)
    auth.ts            verificação de sessão e de administrador
  proxy.ts             renova a sessão e protege /admin (antigo "middleware")
supabase/
  migrations/          migrações SQL versionadas
  config.toml          configuração do Supabase local
scripts/create-admin.mjs  cria o primeiro administrador com segurança
```

### Banco de dados

| Tabela           | Conteúdo                                                        |
| ---------------- | --------------------------------------------------------------- |
| `news`           | notícias (rascunho/publicada, capa, categoria, HTML do texto)   |
| `resources`      | recursos: valor, finalidade, localidade, origem, situação, fotos |
| `news_resources` | vínculo N:N entre notícias e recursos                            |
| `pages`          | páginas institucionais (`sobre`, `contato`)                      |
| `site_settings`  | cores, logotipo, foto principal, textos da home, contatos, redes, ordem das seções |
| `media`          | biblioteca de imagens (arquivos no bucket `media`)               |
| `admin_users`    | quem é administrador                                            |

Situações de um recurso: **solicitado → anunciado → empenhado → pago →
executado**. O site sempre mostra a etapa junto do valor e nunca soma valores de
etapas diferentes.

### Segurança

1. `proxy.ts` redireciona visitantes sem sessão que tentam abrir `/admin`.
2. O layout do painel valida o JWT no servidor (`getClaims`) e exige que o
   usuário esteja em `admin_users`.
3. **Cada Server Action** repete essa verificação antes de gravar.
4. **RLS no banco**: visitantes leem apenas notícias publicadas, recursos
   marcados como visíveis, páginas e configurações; só administradores
   escrevem. Até um usuário autenticado que não seja admin é bloqueado.
5. Storage: leitura pública das imagens; envio e exclusão só por admins. SVG
   não é aceito; limite de 5 MB.
6. O HTML do editor é sanitizado ao salvar e ao exibir.
7. Não há cadastro público; a chave `service_role` não é usada pelo site.

### Publicação e cache

As páginas públicas são servidas do cache (rápidas no celular). Toda gravação
feita pelo painel invalida o cache na hora (`updateTag`), então notícias,
fotos, cores e textos aparecem imediatamente no site. Alterações feitas
**diretamente no painel do Supabase** (fora do site) aparecem em até 1 hora.

## Executar localmente

Requisitos: Node.js 20+ e npm. Para o Supabase local, também Docker.

```bash
npm install
cp .env.example .env.local   # preencha os valores (veja abaixo)
npm run dev                  # http://localhost:3000
```

### Opção A — usar um projeto Supabase na nuvem

Siga a seção "Criar o projeto no Supabase" e coloque a URL e a chave no
`.env.local`.

### Opção B — Supabase local (Docker)

```bash
npx supabase start           # sobe o Supabase e aplica as migrações
```

O comando mostra `API_URL`, `ANON_KEY` e `SERVICE_ROLE_KEY`. Use-os no
`.env.local` (`NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321`). Para recriar o
banco do zero: `npm run db:reset`.

## Criar o projeto no Supabase

1. Crie um projeto em <https://supabase.com/dashboard> (região sugerida:
   São Paulo). Guarde a senha do banco.
2. **Aplique as migrações**, em ordem. Escolha uma forma:
   - **Pelo terminal (recomendado):**
     ```bash
     npx supabase login
     npx supabase link --project-ref SEU_PROJECT_REF
     npx supabase db push
     ```
   - **Pelo navegador:** em *SQL Editor*, cole e execute, nesta ordem, o
     conteúdo de `supabase/migrations/20261012000100_schema.sql`,
     `..._security.sql` e `..._initial_content.sql`.
3. **Bloqueie o cadastro público:** em *Authentication › Sign In / Providers*,
   desative **Allow new users to sign up**. Mantenha o provedor **Email**
   ativado (é com ele que o administrador entra).
4. Em *Authentication › URL Configuration*, defina **Site URL** com o endereço
   do site (ex.: `https://seu-site.vercel.app`).
5. Em *Project Settings › API* (ou *API Keys*), copie a **Project URL**, a chave
   **anon / publishable** e, só para criar o admin, a **service_role / secret**.

O bucket `media` e suas políticas são criados pela migração; não é preciso
criá-lo manualmente.

## Variáveis de ambiente

| Variável                        | Onde usar                | Observação |
| ------------------------------- | ------------------------ | ---------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | `.env.local` e Vercel    | URL do projeto |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `.env.local` e Vercel    | chave pública (anon/publishable); protegida pelo RLS |
| `NEXT_PUBLIC_SITE_URL`          | `.env.local` e Vercel    | endereço público do site (sitemap, Open Graph) |
| `SUPABASE_SERVICE_ROLE_KEY`     | **somente** `.env.local` | usada apenas pelo `npm run create-admin`. Nunca na Vercel, nunca com `NEXT_PUBLIC_` |

## Criar o primeiro administrador (com segurança)

Com `NEXT_PUBLIC_SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` no `.env.local`:

```bash
npm run create-admin -- seu-email@exemplo.com "UmaSenhaForte123"
```

O script cria o usuário (já confirmado) e o registra em `admin_users`. Se o
e-mail já existir, apenas atualiza a senha e concede a permissão. Depois disso,
você pode apagar a chave `service_role` do `.env.local`.

**Alternativa sem terminal:** em *Authentication › Users › Add user* crie o
usuário (marque *Auto Confirm User*) e, no *SQL Editor*, execute:

```sql
insert into public.admin_users (user_id, email)
select id, email from auth.users where email = 'seu-email@exemplo.com';
```

Para remover um administrador: `delete from public.admin_users where email = '...';`

## Publicar na Vercel

1. Envie o repositório ao GitHub e, na Vercel, use **Add New › Project** e
   importe-o (o framework Next.js é detectado automaticamente).
2. Em **Environment Variables**, cadastre `NEXT_PUBLIC_SUPABASE_URL`,
   `NEXT_PUBLIC_SUPABASE_ANON_KEY` e `NEXT_PUBLIC_SITE_URL` (o domínio final).
   **Não** cadastre a `service_role`.
3. Aplique as migrações **antes** do primeiro deploy: o build lê o banco para
   pré-gerar as páginas.
4. Faça o deploy. Depois, ajuste a *Site URL* no Supabase para o domínio da
   Vercel (ou o domínio próprio).

Novos conteúdos não exigem deploy. Só é preciso um novo deploy quando o
**código** mudar.

## Usando o painel

Acesse `/admin` (há um link discreto no rodapé do site).

- **Notícias:** título, resumo, texto rico (negrito, títulos, listas, links,
  imagens), capa, categoria e recursos vinculados. Botões *Salvar rascunho*,
  *Publicar*, *Retirar da publicação*, *Pré-visualizar* e *Excluir* (com
  confirmação). Notícias nas categorias **Projetos** ou **Realizações** aparecem
  na seção "Projetos e realizações" da página inicial.
- **Recursos:** valor (em branco = "Valor a confirmar"), situação, data,
  finalidade, localidade, origem, descrição, fotos, notícias relacionadas e
  opção de exibir/ocultar no site. O vínculo pode ser feito pela notícia ou pelo
  recurso.
- **Páginas:** textos de *Sobre* (com foto) e *Contato*.
- **Imagens:** envio (fotos grandes são reduzidas automaticamente), descrição,
  "onde é usada" e exclusão. Imagens em uso não podem ser excluídas.
- **Configurações:** nome, descrição, logotipo, cores principal e secundária
  (com pré-visualização), textos e foto da página inicial, contatos, redes
  sociais e seções da página inicial (ativar/desativar e subir/descer).

## Verificações realizadas

Testado com Supabase local e Chromium (Playwright), em build de produção:

- login, erro de senha, logout e bloqueio de conta sem permissão de admin;
- criar recurso; criar notícia com texto rico, foto de capa e recurso
  vinculado; publicar e ver no site; card do recurso na notícia e notícia na
  página do recurso;
- editar título e ver a mudança no site sem deploy; alterar cor, textos e
  ordem das seções; retirar da publicação; pré-visualizar rascunho;
- excluir notícia e recurso com confirmação; bloqueio de exclusão de imagem
  em uso;
- RLS: visitante anônimo e usuário autenticado sem permissão não conseguem
  inserir, alterar, excluir, ler rascunhos/biblioteca ou enviar arquivos;
  cadastro público recusado;
- larguras 360, 390, 768, 1024 e 1440 px (site e painel): sem rolagem
  horizontal, menus móveis funcionando.

Scripts úteis: `npm run lint`, `npm run typecheck`, `npm run build`.

## Limitações conhecidas do MVP

- Páginas de notícia/recurso inexistentes mostram "Página não encontrada" e são
  marcadas como `noindex`, mas, por causa do streaming, respondem HTTP 200.
- A pré-visualização mostra a versão **salva** da notícia (salve como rascunho
  antes de pré-visualizar).
- Não há testes automatizados versionados no repositório.
- Fora do escopo desta versão: multiusuário com papéis, agendamento de
  publicação, comentários, automação de redes sociais.
