import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'

// Singleton client instance to avoid multiple GoTrueClient warnings
let supabaseInstance: ReturnType<typeof createSupabaseClient<Database>> | null = null

// Function to reset the singleton instance (useful after signOut)
function resetSupabaseInstance() {
  supabaseInstance = null
  console.log('Supabase instance reset')
}

// Supabase client. In the browser it's a singleton that holds the user's session.
// On the server every call gets a fresh, session-less client: API routes call
// setSession() on it, and a shared instance would leak one user's session into
// another request.
export const createClient = () => {
  if (typeof window === 'undefined') {
    return createSupabaseClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } }
    )
  }

  if (!supabaseInstance) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

    supabaseInstance = createSupabaseClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        // Use localStorage to persist session across browser restarts
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
        // Add storage event listener to detect session changes across tabs
        storageKey: 'sb-auth-token'
      }
    })

    // Add error listener to detect auth failures
    if (typeof window !== 'undefined') {
      supabaseInstance.auth.onAuthStateChange((event, session) => {
        if (event === 'TOKEN_REFRESHED') {
          console.log('Supabase: Token refreshed successfully')
        } else if (event === 'SIGNED_OUT') {
          console.log('Supabase: User signed out')
          resetSupabaseInstance()
        } else if (event === 'USER_UPDATED') {
          console.log('Supabase: User updated')
        }
      })
    }
  }

  return supabaseInstance
}

/**
 * Server-side client that acts as the user who sent `token`, so row-level
 * security sees their auth.uid(). Use in API routes after verifying the token.
 */
export const createTokenClient = (token: string) =>
  createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    }
  )

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