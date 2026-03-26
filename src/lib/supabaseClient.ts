import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// Create a mock client if env vars are missing so the app doesn't crash
export const supabase: SupabaseClient = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey)
  : new Proxy({} as SupabaseClient, {
      get: (_target, prop) => {
        if (prop === 'auth') {
          return {
            signUp: async () => ({ data: { user: { id: 'demo' } }, error: null }),
            signInWithPassword: async () => ({ data: { user: { id: 'demo' } }, error: null }),
            signOut: async () => ({ error: null }),
            onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
            getSession: async () => ({ data: { session: null }, error: null }),
          }
        }
        if (prop === 'from') {
          return () => ({
            select: () => ({ data: [], error: null }),
            upsert: async () => ({ data: null, error: null }),
            insert: async () => ({ data: null, error: null }),
            update: async () => ({ data: null, error: null }),
          })
        }
        return () => {}
      },
    })