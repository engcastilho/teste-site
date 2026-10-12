import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  // Apenas o painel precisa de sessão; o site público fica livre de cookies e
  // pode ser servido do cache.
  matcher: ["/admin/:path*"],
};
