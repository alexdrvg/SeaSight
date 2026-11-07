import { getSessionUser, json, type Env } from '../../_lib/auth';

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  return json({ user: await getSessionUser(request, env) });
};