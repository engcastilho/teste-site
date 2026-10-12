"use client";

import { savePage } from "@/actions/pages";
import type { Page } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/admin/field";
import { ImageField } from "@/components/admin/image-field";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { SubmitButton } from "@/components/admin/submit-button";
import { useFormAction } from "@/components/admin/use-form-action";

export function PageForm({ page, withImage }: { page: Page; withImage?: boolean }) {
  const { pending, onSubmit, errors } = useFormAction(savePage);

  return (
    <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <input type="hidden" name="slug" value={page.slug} />
      <Card className="min-w-0">
        <CardContent className="space-y-5">
          <Field id="title" label="Título" required error={errors.title}>
            <Input id="title" name="title" defaultValue={page.title} maxLength={150} required />
          </Field>
          <Field id="subtitle" label="Subtítulo" error={errors.subtitle}>
            <Input id="subtitle" name="subtitle" defaultValue={page.subtitle} maxLength={300} />
          </Field>
          <Field id="content" label="Texto da página" error={errors.content}>
            <RichTextEditor name="content" defaultValue={page.content} />
          </Field>
        </CardContent>
      </Card>
      <div className="min-w-0 space-y-6">
        {withImage && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Fotografia</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ImageField name="image_url" defaultValue={page.image_url} aspect="aspect-[4/5]" />
              <Field id="image_alt" label="Descrição da fotografia">
                <Input id="image_alt" name="image_alt" defaultValue={page.image_alt ?? ""} maxLength={300} />
              </Field>
            </CardContent>
          </Card>
        )}
        {!withImage && <input type="hidden" name="image_url" value={page.image_url ?? ""} />}
        <SubmitButton pending={pending} pendingLabel="Salvando..." className="w-full">
          Salvar página
        </SubmitButton>
      </div>
    </form>
  );
}
