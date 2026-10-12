#!/usr/bin/env node
/**
 * Cria (ou promove) um usuário administrador.
 *
 * Uso:   npm run create-admin -- email@exemplo.com "SenhaForte123"
 *
 * Lê NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY do .env.local.
 * Rode apenas no seu computador: a chave service_role ignora o RLS e nunca
 * deve ser publicada nem configurada na Vercel.
 */
import { createClient } from "@supabase/supabase-js";

const [email, password] = process.argv.slice(2);
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!email || !password) {
  console.error('Uso: npm run create-admin -- email@exemplo.com "SenhaForte123"');
  process.exit(1);
}
if (password.length < 10) {
  console.error("Use uma senha com pelo menos 10 caracteres.");
  process.exit(1);
}
if (!url || !serviceKey) {
  console.error("Defina NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env.local.");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function findUserByEmail(target) {
  for (let page = 1; page < 50; page++) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    const found = data.users.find((u) => u.email?.toLowerCase() === target.toLowerCase());
    if (found) return found;
    if (data.users.length < 200) return null;
  }
  return null;
}

let user = await findUserByEmail(email);

if (user) {
  const { error } = await supabase.auth.admin.updateUserById(user.id, { password, email_confirm: true });
  if (error) throw error;
  console.log(`Usuário existente encontrado (${email}); senha atualizada.`);
} else {
  const { data, error } = await supabase.auth.admin.createUser({ email, password, email_confirm: true });
  if (error) throw error;
  user = data.user;
  console.log(`Usuário criado: ${email}`);
}

const { error: adminError } = await supabase
  .from("admin_users")
  .upsert({ user_id: user.id, email }, { onConflict: "user_id" });
if (adminError) throw adminError;

console.log("Permissão de administrador concedida. Acesse /admin/login.");
