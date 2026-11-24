/**
 * Minimal Supabase REST helper (no SDK) — used where page weight matters, e.g.
 * guests opening an invitation. The platform uses the full SDK instead.
 */
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
export const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
export const supabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_KEY);

export class RpcError extends Error {
  code?: string;
  constructor(message: string, code?: string) {
    super(message);
    this.code = code;
  }
}

/** Call a Postgres function exposed by Supabase (`/rest/v1/rpc/<fn>`). */
export async function rpc<T = unknown>(fn: string, args: Record<string, unknown>, accessToken?: string): Promise<T> {
  if (!supabaseConfigured) throw new RpcError('Backend not configured');
  const headers: Record<string, string> = { apikey: SUPABASE_KEY!, 'Content-Type': 'application/json' };
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${fn}`, { method: 'POST', headers, body: JSON.stringify(args) });
  const text = await res.text();
  const body = text ? JSON.parse(text) : null;
  if (!res.ok) throw new RpcError(body?.message || res.statusText, body?.code);
  return body as T;
}
