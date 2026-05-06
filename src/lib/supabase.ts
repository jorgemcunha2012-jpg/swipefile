import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase credentials in .env.local');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Auth
export const signUp = (email: string, password: string) =>
  supabase.auth.signUp({ email, password });

export const signIn = (email: string, password: string) =>
  supabase.auth.signInWithPassword({ email, password });

export const signOut = () => supabase.auth.signOut();

export const getSession = () => supabase.auth.getSession();

export const onAuthStateChange = (callback: any) =>
  supabase.auth.onAuthStateChange(callback);

// Offers
export const getOffers = () =>
  supabase.from('offers').select('*').order('created_at', { ascending: false });

export const getOfferById = (id: string) =>
  supabase.from('offers').select('*').eq('id', id).single();

// Saved Offers (Favoritos)
export const getSavedOffers = (userId: string) =>
  supabase.from('saved_offers').select('*').eq('user_id', userId);

export const toggleSavedOffer = async (userId: string, offerId: string) => {
  const { data: existing } = await supabase
    .from('saved_offers')
    .select('id')
    .eq('user_id', userId)
    .eq('offer_id', offerId)
    .single();

  if (existing) {
    return supabase.from('saved_offers').delete().eq('id', existing.id);
  }

  return supabase.from('saved_offers').insert([{ user_id: userId, offer_id: offerId }]);
};

export const isSavedOffer = (userId: string, offerId: string) =>
  supabase
    .from('saved_offers')
    .select('id')
    .eq('user_id', userId)
    .eq('offer_id', offerId)
    .single();

export const resetPassword = (email: string) =>
  supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}`,
  });

export const updatePassword = (newPassword: string) =>
  supabase.auth.updateUser({ password: newPassword });

export const updateProfile = (data: { email?: string; password?: string }) =>
  supabase.auth.updateUser(data);
