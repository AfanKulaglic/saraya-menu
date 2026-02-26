import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

// ─── Server-side Supabase client ────────────────────────
// Uses the service_role key, which BYPASSES Row Level Security.
// Only use this in:
//   • API routes (app/api/...)
//   • Server components
//   • Server actions
// NEVER import this file from client components.

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
