import { json, startSession, type Env, type PublicUser } from '../../_lib/auth';

interface GoogleTokenInfo {
  aud: string;
  iss: string;
  sub: string;
  email: string;
  email_verified: string;
  name?: string;
  picture?: string;
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const body = (await request.json().catch(() => null)) as { credential?: string } | null;
  if (!body?.credential) return json({ error: 'Falta el token de Google' }, 400);

  // Google valida la firma y la caducidad del token
  const res = await fetch(
    `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(body.credential)}`
  );
  if (!res.ok) return json({ error: 'Token de Google no válido' }, 401);

  const p = (await res.json()) as GoogleTokenInfo;
  const validIssuer = p.iss === 'accounts.google.com' || p.iss === 'https://accounts.google.com';
  if (p.aud !== env.GOOGLE_CLIENT_ID || !validIssuer || p.email_verified !== 'true') {
    return json({ error: 'Token de Google rechazado' }, 401);
  }

  const email = p.email.toLowerCase();
  let user = await env.DB.prepare(
    'SELECT id, email, name, avatar_url FROM users WHERE google_sub = ?'
  )
    .bind(p.sub)
    .first<PublicUser>();

  if (!user) {
    const byEmail = await env.DB.prepare(
      'SELECT id, email, name, avatar_url FROM users WHERE email = ?'
    )
      .bind(email)
      .first<PublicUser>();

    if (byEmail) {
      // Ya tenía cuenta con ese correo: vinculamos Google a ella
      await env.DB.prepare(
        'UPDATE users SET google_sub = ?, avatar_url = COALESCE(avatar_url, ?) WHERE id = ?'
      )
        .bind(p.sub, p.picture ?? null, byEmail.id)
        .run();
      user = { ...byEmail, avatar_url: byEmail.avatar_url ?? p.picture ?? null };
    } else {
      const id = crypto.randomUUID();
      const name = p.name ?? email.split('@')[0];
      await env.DB.prepare(
        'INSERT INTO users (id, email, name, google_sub, avatar_url) VALUES (?, ?, ?, ?, ?)'
      )
        .bind(id, email, name, p.sub, p.picture ?? null)
        .run();
      user = { id, email, name, avatar_url: p.picture ?? null };
    }
  }

  const cookie = await startSession(env, request, user.id);
  return json({ user }, 200, { 'Set-Cookie': cookie });
};