/**
 * Supabase SDK client for the Kumbida platform (accounts, orders, admin).
 * Guests viewing an invitation never load this — they use src/lib/rest.ts.
 */
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_KEY, SUPABASE_URL, supabaseConfigured } from './rest';

if (!supabaseConfigured) {
  console.warn('[kumbida] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY are not set — accounts and orders are disabled.');
}

export const supabase = createClient(SUPABASE_URL || 'http://localhost', SUPABASE_KEY || 'missing', {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, flowType: 'pkce' },
});

export type Role = 'customer' | 'staff' | 'admin';

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  role: Role;
}
