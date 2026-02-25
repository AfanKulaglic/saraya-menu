// ─── Supabase Client Configuration ────────────────────────────────────────
// This file sets up the Supabase client for use throughout the application.
// It provides both a browser client (for client components) and typed helpers.
//
// SETUP:
//   1. Install: npm install @supabase/supabase-js @supabase/ssr
//   2. Add to .env.local:
//        NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
//        NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
//   3. Import from this file in your components/stores

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./database.types";

// ─── Browser Client (for "use client" components) ─────────────────────────
// This client uses the anon key and respects RLS policies.
// It automatically handles auth token refresh.

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// Singleton for convenience (most components just need one instance)
let _client: ReturnType<typeof createClient> | null = null;

export function getSupabase() {
  if (!_client) {
    _client = createClient();
  }
  return _client;
}
