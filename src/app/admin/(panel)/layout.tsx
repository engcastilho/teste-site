import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { AdminShell } from "@/components/admin/admin-shell";

/**
 * Todo o painel passa por aqui: a sessão é validada no servidor e o usuário
 * precisa estar em admin_users. As Server Actions e o RLS verificam de novo.
 */
async function AdminGate({ children }: { children: React.ReactNode }) {
  const session = await requireAdmin();
  return <AdminShell email={session.email}>{children}</AdminShell>;
}

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center bg-slate-50 text-muted-foreground">
          <Loader2 className="size-6 animate-spin" aria-label="Carregando" />
        </div>
      }
    >
      <AdminGate>{children}</AdminGate>
    </Suspense>
  );
}
