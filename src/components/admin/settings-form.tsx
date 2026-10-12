"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";
import { saveSettings } from "@/actions/settings";
import { HOME_SECTION_LABELS } from "@/lib/constants";
import { isHexColor, readableTextColor } from "@/lib/theme";
import type { HomeSection, SiteSettings } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/admin/field";
import { ImageField } from "@/components/admin/image-field";
import { SubmitButton } from "@/components/admin/submit-button";
import { useFormAction } from "@/components/admin/use-form-action";

function ColorField({
  id,
  label,
  value,
  onChange,
  error,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string[];
}) {
  return (
    <Field id={id} label={label} error={error}>
      <div className="flex items-center gap-2">
        <input
          type="color"
          aria-label={`${label} (seletor)`}
          value={isHexColor(value) ? value : "#000000"}
          onChange={(e) => onChange(e.target.value)}
          className="h-11 w-14 shrink-0 cursor-pointer rounded-lg border border-input bg-background p-1"
        />
        <Input
          id={id}
          name={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          pattern="^#[0-9a-fA-F]{6}$"
          maxLength={7}
          className="font-mono uppercase"
          aria-invalid={Boolean(error) || !isHexColor(value)}
        />
      </div>
    </Field>
  );
}

export function SettingsForm({ settings }: { settings: SiteSettings }) {
  const { pending, onSubmit, errors } = useFormAction(saveSettings);
  const [primary, setPrimary] = useState(settings.primary_color);
  const [secondary, setSecondary] = useState(settings.secondary_color);
  const [sections, setSections] = useState<HomeSection[]>(settings.home_sections);

  function move(index: number, delta: -1 | 1) {
    setSections((prev) => {
      const next = [...prev];
      const target = index + delta;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  const previewPrimary = isHexColor(primary) ? primary : settings.primary_color;
  const previewSecondary = isHexColor(secondary) ? secondary : settings.secondary_color;

  return (
    <form onSubmit={onSubmit} className="space-y-6 pb-24">
      <input type="hidden" name="home_sections" value={JSON.stringify(sections)} />

      <Card>
        <CardHeader>
          <CardTitle>Identidade</CardTitle>
          <CardDescription>Nome, descrição usada pelos buscadores e logotipo.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5 md:grid-cols-[minmax(0,1fr)_240px]">
          <div className="space-y-5">
            <Field id="site_name" label="Nome do site" required error={errors.site_name}>
              <Input id="site_name" name="site_name" defaultValue={settings.site_name} required maxLength={100} />
            </Field>
            <Field id="site_description" label="Descrição do site" error={errors.site_description} hint="Aparece no Google e ao compartilhar o link.">
              <Textarea id="site_description" name="site_description" defaultValue={settings.site_description} rows={3} maxLength={300} />
            </Field>
          </div>
          <Field id="logo_url" label="Logotipo" error={errors.logo_url} hint="Imagem quadrada. Sem logotipo, as iniciais são exibidas.">
            <ImageField name="logo_url" defaultValue={settings.logo_url} aspect="aspect-square" />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cores</CardTitle>
          <CardDescription>A cor do texto sobre cada cor é escolhida automaticamente para manter a legibilidade.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <div className="space-y-5">
            <ColorField id="primary_color" label="Cor principal" value={primary} onChange={setPrimary} error={errors.primary_color} />
            <ColorField id="secondary_color" label="Cor secundária" value={secondary} onChange={setSecondary} error={errors.secondary_color} />
          </div>
          <div className="rounded-xl border p-4" aria-label="Pré-visualização das cores">
            <p className="mb-3 text-xs font-medium text-muted-foreground uppercase">Pré-visualização</p>
            <div className="space-y-3">
              <div className="rounded-lg p-4" style={{ background: previewPrimary, color: readableTextColor(previewPrimary) }}>
                <p className="font-semibold">Faixa na cor principal</p>
                <p className="text-sm opacity-90">Texto legível sobre a cor.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-lg px-4 py-2 text-sm font-medium" style={{ background: previewPrimary, color: readableTextColor(previewPrimary) }}>
                  Botão principal
                </span>
                <span className="rounded-lg px-4 py-2 text-sm font-medium" style={{ background: previewSecondary, color: readableTextColor(previewSecondary) }}>
                  Botão secundário
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Página inicial</CardTitle>
          <CardDescription>Textos e fotografia da seção principal e da apresentação.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5 md:grid-cols-[minmax(0,1fr)_240px]">
          <div className="space-y-5">
            <Field id="hero_eyebrow" label="Texto acima do título" error={errors.hero_eyebrow}>
              <Input id="hero_eyebrow" name="hero_eyebrow" defaultValue={settings.hero_eyebrow} maxLength={100} />
            </Field>
            <Field id="hero_title" label="Título principal" error={errors.hero_title}>
              <Input id="hero_title" name="hero_title" defaultValue={settings.hero_title} maxLength={160} />
            </Field>
            <Field id="hero_subtitle" label="Mensagem de apresentação" error={errors.hero_subtitle}>
              <Textarea id="hero_subtitle" name="hero_subtitle" defaultValue={settings.hero_subtitle} rows={3} maxLength={400} />
            </Field>
            <Field id="about_title" label="Título da seção institucional" error={errors.about_title}>
              <Input id="about_title" name="about_title" defaultValue={settings.about_title} maxLength={120} />
            </Field>
            <Field id="about_text" label="Texto da seção institucional" error={errors.about_text}>
              <Textarea id="about_text" name="about_text" defaultValue={settings.about_text} rows={5} maxLength={2000} />
            </Field>
          </div>
          <Field id="hero_image_url" label="Fotografia principal" error={errors.hero_image_url} hint="Vertical (retrato) funciona melhor.">
            <ImageField name="hero_image_url" defaultValue={settings.hero_image_url} aspect="aspect-[4/5]" />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Seções da página inicial</CardTitle>
          <CardDescription>Ative, desative e mude a ordem. A seção principal (foto e mensagem) fica sempre no topo.</CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="divide-y rounded-lg border">
            {sections.map((section, index) => (
              <li key={section.key} className="flex items-center gap-3 px-3 py-2.5">
                <span className="w-5 text-sm text-muted-foreground tabular-nums">{index + 1}.</span>
                <span className={`flex-1 text-sm font-medium ${section.enabled ? "" : "text-muted-foreground line-through"}`}>
                  {HOME_SECTION_LABELS[section.key]}
                </span>
                <Switch
                  checked={section.enabled}
                  aria-label={`Exibir ${HOME_SECTION_LABELS[section.key]}`}
                  onCheckedChange={(checked) =>
                    setSections((prev) => prev.map((s) => (s.key === section.key ? { ...s, enabled: checked } : s)))
                  }
                />
                <Button type="button" variant="ghost" size="icon-sm" disabled={index === 0} onClick={() => move(index, -1)} aria-label={`Subir ${HOME_SECTION_LABELS[section.key]}`}>
                  <ArrowUp />
                </Button>
                <Button type="button" variant="ghost" size="icon-sm" disabled={index === sections.length - 1} onClick={() => move(index, 1)} aria-label={`Descer ${HOME_SECTION_LABELS[section.key]}`}>
                  <ArrowDown />
                </Button>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contato</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5 sm:grid-cols-2">
          <Field id="whatsapp" label="WhatsApp" error={errors.whatsapp} hint="Com DDD. Ex.: (69) 99999-9999">
            <Input id="whatsapp" name="whatsapp" type="tel" defaultValue={settings.whatsapp} maxLength={20} />
          </Field>
          <Field id="contact_phone" label="Telefone" error={errors.contact_phone}>
            <Input id="contact_phone" name="contact_phone" type="tel" defaultValue={settings.contact_phone} maxLength={40} />
          </Field>
          <Field id="contact_email" label="E-mail" error={errors.contact_email}>
            <Input id="contact_email" name="contact_email" type="email" defaultValue={settings.contact_email} />
          </Field>
          <Field id="office_hours" label="Horário de atendimento" error={errors.office_hours}>
            <Input id="office_hours" name="office_hours" defaultValue={settings.office_hours} maxLength={200} />
          </Field>
          <Field id="address" label="Endereço" error={errors.address} className="sm:col-span-2">
            <Input id="address" name="address" defaultValue={settings.address} maxLength={300} />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Redes sociais</CardTitle>
          <CardDescription>Cole o endereço completo do perfil. Campos vazios não aparecem no site.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5 sm:grid-cols-2">
          {(
            [
              ["instagram_url", "Instagram", "https://instagram.com/..."],
              ["facebook_url", "Facebook", "https://facebook.com/..."],
              ["youtube_url", "YouTube", "https://youtube.com/@..."],
              ["tiktok_url", "TikTok", "https://tiktok.com/@..."],
            ] as const
          ).map(([key, label, placeholder]) => (
            <Field key={key} id={key} label={label} error={errors[key]}>
              <Input id={key} name={key} type="url" inputMode="url" defaultValue={settings[key]} placeholder={placeholder} />
            </Field>
          ))}
        </CardContent>
      </Card>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t bg-white/95 backdrop-blur lg:left-64">
        <div className="mx-auto flex max-w-6xl justify-end px-4 py-3 sm:px-6">
          <SubmitButton pending={pending} pendingLabel="Salvando...">
            Salvar configurações
          </SubmitButton>
        </div>
      </div>
    </form>
  );
}
