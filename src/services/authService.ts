// ─── Auth Service ────────────────────────────────────────
// Replaces: authStore's hardcoded password checks and localStorage users
// Uses: Supabase Auth for real authentication + public.users profile table

import { supabase } from '@/lib/supabase';
import type { Tables, InsertDto } from '@/types/supabase';

export type AppUserRow = Tables<'users'>;
export type RestaurantAccessRow = Tables<'restaurant_access'>;

// ─── Authentication ──────────────────────────────────────

export async function signUp(email: string, password: string, name: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name } },
  });
  if (error) throw error;
  return data;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentSession() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

export function onAuthStateChange(callback: (session: unknown) => void) {
  return supabase.auth.onAuthStateChange((_event, session) => {
    callback(session);
  });
}

// ─── User Profile (public.users) ─────────────────────────

export async function getCurrentUserProfile(): Promise<AppUserRow | null> {
  const session = await getCurrentSession();
  if (!session) return null;

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('auth_id', session.user.id)
    .single();

  if (error) return null;
  return data;
}

export async function getAllUsers(): Promise<AppUserRow[]> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function updateUserProfile(userId: string, updates: Partial<InsertDto<'users'>>) {
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteUser(userId: string) {
  const { error } = await supabase.from('users').delete().eq('id', userId);
  if (error) throw error;
}

// ─── Restaurant Access (roles) ───────────────────────────

export async function getUserRestaurantAccess(userId: string): Promise<RestaurantAccessRow[]> {
  const { data, error } = await supabase
    .from('restaurant_access')
    .select('*')
    .eq('user_id', userId);

  if (error) throw error;
  return data ?? [];
}

export async function getRestaurantStaff(restaurantId: string): Promise<(RestaurantAccessRow & { user: AppUserRow })[]> {
  const { data, error } = await supabase
    .from('restaurant_access')
    .select('*, user:users(*)')
    .eq('restaurant_id', restaurantId);

  if (error) throw error;
  return (data ?? []) as any;
}

export async function assignRestaurantRole(
  userId: string,
  restaurantId: string,
  role: 'manager' | 'employee'
) {
  const { data, error } = await supabase
    .from('restaurant_access')
    .upsert(
      { user_id: userId, restaurant_id: restaurantId, role },
      { onConflict: 'user_id,restaurant_id' }
    )
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function removeRestaurantAccess(userId: string, restaurantId: string) {
  const { error } = await supabase
    .from('restaurant_access')
    .delete()
    .eq('user_id', userId)
    .eq('restaurant_id', restaurantId);

  if (error) throw error;
}
