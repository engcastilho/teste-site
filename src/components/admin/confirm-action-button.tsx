"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { ActionResult } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type Result = ActionResult & { usage?: string[] };

/**
 * Executa uma Server Action após confirmação. Usado para excluir, publicar ou
 * retirar da publicação diretamente nas listas.
 */
export function ConfirmActionButton({
  action,
  title,
  description,
  confirmLabel,
  destructive,
  redirectTo,
  children,
  ...buttonProps
}: Omit<React.ComponentProps<typeof Button>, "action"> & {
  action: () => Promise<Result>;
  title: string;
  description: React.ReactNode;
  confirmLabel: string;
  destructive?: boolean;
  redirectTo?: string;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function run() {
    startTransition(async () => {
      const result = await action();
      if (result?.ok) {
        toast.success(result.message);
        setOpen(false);
        if (redirectTo) router.push(redirectTo);
        else router.refresh();
      } else {
        toast.error(result?.message ?? "Não foi possível concluir a ação.", {
          description: result?.usage?.length ? (
            <ul className="mt-1 list-disc pl-4">
              {result.usage.map((u) => (
                <li key={u}>{u}</li>
              ))}
            </ul>
          ) : undefined,
          duration: result?.usage?.length ? 10000 : undefined,
        });
        setOpen(false);
      }
    });
  }

  return (
    <AlertDialog open={open} onOpenChange={(v) => !pending && setOpen(v)}>
      <AlertDialogTrigger asChild>
        <Button type="button" {...buttonProps}>
          {children}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div>{description}</div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Cancelar</AlertDialogCancel>
          <Button variant={destructive ? "destructive" : "default"} onClick={run} disabled={pending}>
            {pending && <Loader2 className="animate-spin" aria-hidden />}
            {confirmLabel}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
