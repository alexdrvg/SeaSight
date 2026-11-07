import { hashPassword, json, startSession, type Env, type PublicUser } from '../../_lib/auth';

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const body = (await request.json().catch(() => null)) as
    | { email?: string; password?: string; name?: string }
    | null;

  const email = body?.email?.trim().toLowerCase() ?? '';
  const password = body?.password ?? '';
  const name = body?.name?.trim() || email.split('@')[0];

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json({ error: 'Correo electrónico no válido' }, 400);
  }
  if (password.length < 8) {
    return json({ error: 'La contraseña debe tener al menos 8 caracteres' }, 400);
  }

  const exists = await env.DB.prepare('SELECT 1 FROM users WHERE email = ?').bind(email).first();
  if (exists) return json({ error: 'Ya existe una cuenta con ese correo' }, 409);

  const id = crypto.randomUUID();
  const { hash, salt } = await hashPassword(password);

  try {
    await env.DB.prepare(
      'INSERT INTO users (id, email, name, password_hash, password_salt) VALUES (?, ?, ?, ?, ?)'
    )
      .bind(id, email, name, hash, salt)
      .run();
  } catch {
    return json({ error: 'Ya existe una cuenta con ese correo' }, 409);
  }

  const user: PublicUser = { id, email, name, avatar_url: null };
  const cookie = await startSession(env, request, id);
  return json({ user }, 201, { 'Set-Cookie': cookie });
};