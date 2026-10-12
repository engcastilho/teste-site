import { createBrowserClient } from "@supabase/ssr";

/** Cliente do navegador (usado apenas no painel, para enviar imagens). */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
