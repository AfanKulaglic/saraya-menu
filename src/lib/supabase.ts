import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

// ─── Browser (client-side) Supabase client ──────────────
// Uses the anon key — RLS policies enforce authorization.
// Safe to use in React components and client-side stores.

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. ' +
    'Copy .env.example to .env.local and fill in your project credentials.'
  );
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
