"use client";

import { startTransition, useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { ActionState } from "@/lib/types";

/**
 * Liga um formulário a uma Server Action sem o reset automático do React 19
 * (que apagaria o que foi digitado em caso de erro de validação). Também
 * informa qual botão foi clicado e mostra o resultado como notificação.
 */
export function useFormAction(action: (prev: ActionState, formData: FormData) => Promise<ActionState>) {
  const [state, dispatch, pending] = useActionState(action, null);
  const [submitter, setSubmitter] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!state?.message) return;
    if (state.ok) {
      toast.success(state.message);
      // Recarrega os dados do servidor (ex.: status de publicação atualizado).
      router.refresh();
    } else toast.error(state.message);
  }, [state, router]);

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const button = (event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
    const formData = new FormData(event.currentTarget, button);
    setSubmitter(button?.value || null);
    startTransition(() => dispatch(formData));
  }

  return { state, pending, submitter, onSubmit, errors: state?.fieldErrors ?? {} };
}
