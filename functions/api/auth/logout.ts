import { clearCookie, endSession, json, type Env } from '../../_lib/auth';

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  await endSession(request, env);
  return json({ ok: true }, 200, { 'Set-Cookie': clearCookie(request) });
};