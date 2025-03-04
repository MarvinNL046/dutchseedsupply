import { createClient } from '@supabase/supabase-js';

/**
 * Create a Supabase client for server-side operations
 * No authentication required
 */
export function createServerSupabaseClient() {
  // Support both naming conventions for Supabase URL and key
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.warn('Supabase URL or key is missing. Using dummy client.');
    // Return a dummy client that won't throw errors
    return {
      from: () => ({
        select: () => ({ data: [], error: null }),
        insert: () => ({ data: null, error: null }),
        update: () => ({ data: null, error: null }),
        delete: () => ({ data: null, error: null }),
      }),
      rpc: () => ({ data: null, error: null }),
      storage: {
        from: () => ({
          upload: () => ({ data: null, error: null }),
          getPublicUrl: () => ({ data: { publicUrl: '' }, error: null }),
        }),
      },
    };
  }
  
  return createClient(supabaseUrl, supabaseKey);
}

/**
 * Simplified function to check if a user is an admin
 * Always returns true since we've removed authentication
 */
export async function checkAdminAuth() {
  return {
    isAdmin: true,
    user: { email: 'admin@example.com' },
    debugMode: true,
  };
}
