import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'

// Singleton client instance to avoid multiple GoTrueClient warnings
let supabaseInstance: ReturnType<typeof createSupabaseClient<Database>> | null = null

// Function to reset the singleton instance (useful after signOut)
function resetSupabaseInstance() {
  supabaseInstance = null
  console.log('Supabase instance reset')
}

// Client-side Supabase client
export const createClient = () => {
  if (!supabaseInstance) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

    supabaseInstance = createSupabaseClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        // Use localStorage to persist session across browser restarts
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false
      }
    })
  }

  return supabaseInstance
}

// Force create new client (useful after signOut)
export const createNewClient = () => {
  resetSupabaseInstance()
  return createClient()
}

// Server-side Supabase client (same as client for now)
export const createServerClient = () => {
  return createClient()
}

// Admin client for server actions
export const createAdminClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  if (!supabaseServiceKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is required for admin operations')
  }

  return createSupabaseClient<Database>(supabaseUrl, supabaseServiceKey)
}

// Clear all Supabase instances and auth data
export const clearSupabaseAuth = () => {
  resetSupabaseInstance()
}

// Type helpers
export type SupabaseClient = ReturnType<typeof createClient>