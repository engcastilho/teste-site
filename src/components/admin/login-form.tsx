"use client";

import { signIn } from "@/actions/auth";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/admin/field";
import { SubmitButton } from "@/components/admin/submit-button";
import { useFormAction } from "@/components/admin/use-form-action";

export function LoginForm({ next }: { next?: string }) {
  const { pending, onSubmit, errors } = useFormAction(signIn);
  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <input type="hidden" name="next" value={next ?? ""} />
      <Field id="email" label="E-mail" error={errors.email}>
        <Input id="email" name="email" type="email" autoComplete="email" required autoFocus />
      </Field>
      <Field id="password" label="Senha" error={errors.password}>
        <Input id="password" name="password" type="password" autoComplete="current-password" required />
      </Field>
      <SubmitButton pending={pending} pendingLabel="Entrando..." className="w-full" size="lg">
        Entrar
      </SubmitButton>
    </form>
  );
}
