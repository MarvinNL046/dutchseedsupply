import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  // Support both naming conventions for Supabase URL and key
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  
  return createBrowserClient(
    supabaseUrl!,
    supabaseKey!
  );
}
