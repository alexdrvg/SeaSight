import { json, startSession, verifyPassword, type Env, type PublicUser } from '../../_lib/auth';

interface UserRow extends PublicUser {
  password_hash: string | null;
  password_salt: string | null;
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const body = (await request.json().catch(() => null)) as
    | { email?: string; password?: string }
    | null;

  const email = body?.email?.trim().toLowerCase() ?? '';
  const password = body?.password ?? '';
  const invalid = () => json({ error: 'Correo o contraseña incorrectos' }, 401);

  if (!email || !password) return invalid();

  const row = await env.DB.prepare(
    'SELECT id, email, name, avatar_url, password_hash, password_salt FROM users WHERE email = ?'
  )
    .bind(email)
    .first<UserRow>();

  // Las cuentas creadas solo con Google no tienen contraseña
  if (!row?.password_hash || !row.password_salt) return invalid();
  if (!(await verifyPassword(password, row.password_hash, row.password_salt))) return invalid();

  const { password_hash, password_salt, ...user } = row;
  const cookie = await startSession(env, request, user.id);
  return json({ user }, 200, { 'Set-Cookie': cookie });
};