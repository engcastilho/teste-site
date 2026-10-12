"use client";

import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = React.ComponentProps<typeof Button> & {
  pending: boolean;
  /** Valor do botão clicado (de useFormAction), para mostrar o carregamento só nele. */
  submitter?: string | null;
  pendingLabel?: string;
};

export function SubmitButton({ children, pending, submitter, pendingLabel, value, disabled, ...props }: Props) {
  const isThis = pending && (value === undefined || submitter === value);
  return (
    <Button type="submit" value={value} disabled={pending || disabled} aria-busy={isThis} {...props}>
      {isThis && <Loader2 className="animate-spin" aria-hidden />}
      {isThis && pendingLabel ? pendingLabel : children}
    </Button>
  );
}
