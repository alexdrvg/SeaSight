export interface Env {
  DB: D1Database;
  GOOGLE_CLIENT_ID: string;
}

export interface PublicUser {
  id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
}

const enc = new TextEncoder();
const PBKDF2_ITERATIONS = 100_000; // máximo permitido en Workers
const SESSION_SECONDS = 60 * 60 * 24 * 30; // 30 días

const toHex = (bytes: Uint8Array) =>
  Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
const fromHex = (hex: string) =>
  new Uint8Array(hex.match(/.{2}/g)!.map((h) => parseInt(h, 16)));

export const sha256Hex = async (value: string) =>
  toHex(new Uint8Array(await crypto.subtle.digest('SHA-256', enc.encode(value))));

export async function hashPassword(password: string, saltHex?: string) {
  const salt = saltHex ? fromHex(saltHex) : crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt, iterations: PBKDF2_ITERATIONS },
    key,
    256
  );
  return { hash: toHex(new Uint8Array(bits)), salt: toHex(salt) };
}

const safeEqual = (a: string, b: string) => {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
};

export async function verifyPassword(password: string, hashHex: string, saltHex: string) {
  const { hash } = await hashPassword(password, saltHex);
  return safeEqual(hash, hashHex);
}

export const json = (data: unknown, status = 200, headers: HeadersInit = {}) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...headers },
  });

const buildCookie = (value: string, maxAge: number, request: Request) =>
  `session=${value}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${maxAge}` +
  (new URL(request.url).protocol === 'https:' ? '; Secure' : '');

export const clearCookie = (request: Request) => buildCookie('', 0, request);

/** Crea la sesión en D1 y devuelve el valor de la cabecera Set-Cookie */
export async function startSession(env: Env, request: Request, userId: string) {
  const now = Math.floor(Date.now() / 1000);
  const token = toHex(crypto.getRandomValues(new Uint8Array(32)));

  await env.DB.batch([
    env.DB.prepare('DELETE FROM sessions WHERE expires_at < ?').bind(now),
    env.DB.prepare('INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)').bind(
      await sha256Hex(token),
      userId,
      now + SESSION_SECONDS
    ),
  ]);

  return buildCookie(token, SESSION_SECONDS, request);
}

const getToken = (request: Request) =>
  request.headers.get('Cookie')?.match(/(?:^|;\s*)session=([a-f0-9]+)/)?.[1] ?? null;

export async function getSessionUser(request: Request, env: Env): Promise<PublicUser | null> {
  const token = getToken(request);
  if (!token) return null;
  return env.DB.prepare(
    `SELECT u.id, u.email, u.name, u.avatar_url
       FROM sessions s JOIN users u ON u.id = s.user_id
      WHERE s.token_hash = ? AND s.expires_at > ?`
  )
    .bind(await sha256Hex(token), Math.floor(Date.now() / 1000))
    .first<PublicUser>();
}

export async function endSession(request: Request, env: Env) {
  const token = getToken(request);
  if (token) {
    await env.DB.prepare('DELETE FROM sessions WHERE token_hash = ?').bind(await sha256Hex(token)).run();
  }
}