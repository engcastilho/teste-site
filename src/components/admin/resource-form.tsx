"use client";

import { useState } from "react";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { saveResource } from "@/actions/resources";
import { RESOURCE_STATUSES, RESOURCE_STATUS_INFO } from "@/lib/constants";
import { slugify } from "@/lib/slug";
import type { Resource, ResourceStatus } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Field } from "@/components/admin/field";
import { MultiImageField } from "@/components/admin/image-field";
import { LinkSelector, type LinkOption } from "@/components/admin/link-selector";
import { SubmitButton } from "@/components/admin/submit-button";
import { useFormAction } from "@/components/admin/use-form-action";

function formatAmountInput(value: number | null | undefined) {
  if (value === null || value === undefined) return "";
  return value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function ResourceForm({
  resource,
  newsOptions,
  linkedNewsIds,
}: {
  resource?: Resource;
  newsOptions: LinkOption[];
  linkedNewsIds: string[];
}) {
  const { pending, submitter, onSubmit, errors } = useFormAction(saveResource);
  const [title, setTitle] = useState(resource?.title ?? "");
  const [status, setStatus] = useState<ResourceStatus>(resource?.status ?? "solicitado");

  return (
    <form onSubmit={onSubmit} className="grid gap-6 pb-24 lg:grid-cols-[minmax(0,1fr)_340px]">
      {resource && <input type="hidden" name="id" value={resource.id} />}

      <div className="min-w-0 space-y-6">
        <Card>
          <CardContent className="space-y-5">
            <Field id="title" label="Título" required error={errors.title}>
              <Input id="title" name="title" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={200} required aria-invalid={Boolean(errors.title)} placeholder="Ex.: Recurso para aquisição de equipamentos de saúde" />
            </Field>
            <Field
              id="slug"
              label="Endereço da página"
              error={errors.slug}
              hint={<>Em branco = automático: <span className="font-mono break-all">/recursos/{slugify(resource?.slug || title) || "..."}</span></>}
            >
              <Input id="slug" name="slug" defaultValue={resource?.slug ?? ""} maxLength={120} aria-invalid={Boolean(errors.slug)} />
            </Field>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field id="amount" label="Valor (R$)" error={errors.amount} hint="Deixe em branco se o valor ainda não foi confirmado.">
                <Input id="amount" name="amount" inputMode="decimal" defaultValue={formatAmountInput(resource?.amount)} placeholder="200.000,00" aria-invalid={Boolean(errors.amount)} />
              </Field>
              <Field id="reference_date" label="Data" error={errors.reference_date} hint="Data da etapa atual (ex.: data do empenho).">
                <Input id="reference_date" name="reference_date" type="date" defaultValue={resource?.reference_date ?? ""} aria-invalid={Boolean(errors.reference_date)} />
              </Field>
            </div>

            <Field id="status" label="Situação do recurso" required error={errors.status} hint={RESOURCE_STATUS_INFO[status].description}>
              <NativeSelect id="status" name="status" value={status} onChange={(e) => setStatus(e.target.value as ResourceStatus)}>
                {RESOURCE_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {RESOURCE_STATUS_INFO[s].label}
                  </option>
                ))}
              </NativeSelect>
            </Field>

            <Field id="purpose" label="Finalidade" error={errors.purpose}>
              <Textarea id="purpose" name="purpose" defaultValue={resource?.purpose ?? ""} rows={2} maxLength={1000} placeholder="Para que o recurso será usado." />
            </Field>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field id="location" label="Localidade beneficiada" error={errors.location}>
                <Input id="location" name="location" defaultValue={resource?.location ?? ""} maxLength={300} placeholder="Bairro, distrito ou linha" />
              </Field>
              <Field id="origin" label="Origem do recurso" error={errors.origin}>
                <Input id="origin" name="origin" defaultValue={resource?.origin ?? ""} maxLength={300} placeholder="Ex.: emenda parlamentar estadual" />
              </Field>
            </div>
            <Field id="description" label="Descrição" error={errors.description}>
              <Textarea id="description" name="description" defaultValue={resource?.description ?? ""} rows={5} maxLength={5000} />
            </Field>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Fotografias</CardTitle>
          </CardHeader>
          <CardContent>
            <MultiImageField name="photos" defaultValue={resource?.photos ?? []} />
          </CardContent>
        </Card>
      </div>

      <div className="min-w-0 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Visibilidade</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <Label htmlFor="is_published" className="leading-snug">Exibir no site</Label>
              <Switch id="is_published" name="is_published" defaultChecked={resource?.is_published ?? true} />
            </div>
            <p className="text-xs text-muted-foreground">Recursos ocultos ficam apenas no painel.</p>
            {resource?.is_published && (
              <Button asChild variant="ghost" size="sm">
                <Link href={`/recursos/${resource.slug}`} target="_blank">
                  <ExternalLink /> Ver no site
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Notícias relacionadas</CardTitle>
          </CardHeader>
          <CardContent>
            <LinkSelector name="news_ids" options={newsOptions} defaultSelected={linkedNewsIds} emptyText="Nenhuma notícia cadastrada." />
            <p className="mt-2 text-xs text-muted-foreground">Rascunhos vinculados só aparecem no site depois de publicados.</p>
          </CardContent>
        </Card>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t bg-white/95 backdrop-blur lg:left-64">
        <div className="mx-auto flex max-w-6xl justify-end px-4 py-3 sm:px-6">
          <SubmitButton pending={pending} submitter={submitter} pendingLabel="Salvando...">Salvar recurso</SubmitButton>
        </div>
      </div>
    </form>
  );
}
