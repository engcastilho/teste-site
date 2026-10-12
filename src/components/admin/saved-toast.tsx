"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";

/** Mostra a confirmação após criar um item (o servidor redireciona com ?salvo=). */
export function SavedToast({ message }: { message?: string }) {
  const shown = useRef(false);
  const router = useRouter();
  const pathname = usePathname();
  useEffect(() => {
    if (!message || shown.current) return;
    shown.current = true;
    toast.success(message);
    router.replace(pathname, { scroll: false });
  }, [message, pathname, router]);
  return null;
}
