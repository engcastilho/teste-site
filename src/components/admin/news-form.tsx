"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, ExternalLink } from "lucide-react";
import { saveNews } from "@/actions/news";
import { NEWS_CATEGORY_SUGGESTIONS } from "@/lib/constants";
import { slugify } from "@/lib/slug";
import type { News } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/admin/field";
import { ImageField } from "@/components/admin/image-field";
import { LinkSelector, type LinkOption } from "@/components/admin/link-selector";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { SubmitButton } from "@/components/admin/submit-button";
import { useFormAction } from "@/components/admin/use-form-action";

export function NewsForm({
  news,
  resourceOptions,
  linkedResourceIds,
}: {
  news?: News;
  resourceOptions: LinkOption[];
  linkedResourceIds: string[];
}) {
  const { pending, submitter, onSubmit, errors } = useFormAction(saveNews);

  const [title, setTitle] = useState(news?.title ?? "");
  const [excerpt, setExcerpt] = useState(news?.excerpt ?? "");
  const [coverAlt, setCoverAlt] = useState(news?.cover_image_alt ?? "");
  const isPublished = news?.status === "published";

  return (
    <form onSubmit={onSubmit} className="grid gap-6 pb-24 lg:grid-cols-[minmax(0,1fr)_340px]">
      {news && <input type="hidden" name="id" value={news.id} />}

      <div className="min-w-0 space-y-6">
        <Card>
          <CardContent className="space-y-5">
            <Field id="title" label="Título" required error={errors.title}>
              <Input
                id="title"
                name="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={200}
                required
                aria-invalid={Boolean(errors.title)}
                placeholder="Ex.: Município recebe investimento para melhoria da saúde"
              />
            </Field>
            <Field
              id="slug"
              label="Endereço da página"
              error={errors.slug}
              hint={
                <>
                  Deixe em branco para gerar automaticamente:{" "}
                  <span className="font-mono break-all">/noticias/{slugify(news?.slug || title) || "..."}</span>
                </>
              }
            >
              <Input id="slug" name="slug" defaultValue={news?.slug ?? ""} maxLength={120} placeholder="gerado-a-partir-do-titulo" aria-invalid={Boolean(errors.slug)} />
            </Field>
            <Field id="excerpt" label="Resumo" error={errors.excerpt} hint={`${excerpt.length}/400 — aparece nos cards e no compartilhamento em redes sociais.`}>
              <Textarea id="excerpt" name="excerpt" value={excerpt} onChange={(e) => setExcerpt(e.target.value)} maxLength={400} rows={3} aria-invalid={Boolean(errors.excerpt)} />
            </Field>
            <Field id="content" label="Conteúdo" error={errors.content}>
              <RichTextEditor name="content" defaultValue={news?.content ?? ""} />
            </Field>
          </CardContent>
        </Card>
      </div>

      <div className="min-w-0 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between gap-2 text-base">
              Publicação
              {news ? (
                <Badge variant={isPublished ? "success" : "warning"}>{isPublished ? "Publicada" : "Rascunho"}</Badge>
              ) : (
                <Badge variant="secondary">Nova</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              {isPublished
                ? "Esta notícia está visível no site. Alterações salvas aparecem imediatamente."
                : "Rascunhos não aparecem no site. Publique quando estiver pronta."}
            </p>
            {news ? (
              <div className="flex flex-col gap-2">
                <Button asChild variant="outline" size="sm">
                  <Link href={`/admin/noticias/${news.id}/previa`} target="_blank">
                    <Eye /> Pré-visualizar (versão salva)
                  </Link>
                </Button>
                {isPublished && (
                  <Button asChild variant="ghost" size="sm">
                    <Link href={`/noticias/${news.slug}`} target="_blank">
                      <ExternalLink /> Ver no site
                    </Link>
                  </Button>
                )}
              </div>
            ) : (
              <p>Salve como rascunho para liberar a pré-visualização.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <Field id="category" label="Categoria" error={errors.category} hint="Projetos e Realizações aparecem na seção “Projetos e realizações” da página inicial.">
              <Input id="category" name="category" list="news-categories" defaultValue={news?.category ?? "Notícias"} maxLength={60} required />
              <datalist id="news-categories">
                {NEWS_CATEGORY_SUGGESTIONS.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </Field>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Imagem de capa</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ImageField
              name="cover_image_url"
              defaultValue={news?.cover_image_url}
              onChange={(_url, alt) => alt && !coverAlt && setCoverAlt(alt)}
            />
            <Field id="cover_image_alt" label="Descrição da imagem" hint="Ajuda pessoas com deficiência visual e melhora a busca.">
              <Input id="cover_image_alt" name="cover_image_alt" value={coverAlt} onChange={(e) => setCoverAlt(e.target.value)} maxLength={300} />
            </Field>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recursos vinculados</CardTitle>
          </CardHeader>
          <CardContent>
            <LinkSelector
              name="resource_ids"
              options={resourceOptions}
              defaultSelected={linkedResourceIds}
              emptyText="Nenhum recurso cadastrado. Cadastre em Recursos."
            />
          </CardContent>
        </Card>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t bg-white/95 backdrop-blur lg:left-64">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-end gap-2 px-4 py-3 sm:px-6">
          {isPublished ? (
            <>
              <SubmitButton pending={pending} submitter={submitter} name="intent" value="draft" variant="outline" pendingLabel="Retirando...">
                Retirar da publicação
              </SubmitButton>
              <SubmitButton pending={pending} submitter={submitter} name="intent" value="save" pendingLabel="Salvando...">
                Salvar alterações
              </SubmitButton>
            </>
          ) : (
            <>
              <SubmitButton pending={pending} submitter={submitter} name="intent" value="draft" variant="outline" pendingLabel="Salvando...">
                Salvar rascunho
              </SubmitButton>
              <SubmitButton pending={pending} submitter={submitter} name="intent" value="publish" pendingLabel="Publicando...">
                Publicar
              </SubmitButton>
            </>
          )}
        </div>
      </div>
    </form>
  );
}
