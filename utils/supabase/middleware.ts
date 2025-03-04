import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Update the Supabase auth session in the middleware
 * This is used to refresh the session and update the cookies
 */
export async function updateSession(request: NextRequest) {
  // Create a response object that we can modify
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Support both naming conventions for Supabase URL and key
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

  // Create a Supabase client for this specific middleware invocation
  const supabase = createServerClient(
    supabaseUrl!,
    supabaseKey!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options) {
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options) {
          response.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );

  // Refresh the session if expired
  try {
    const { data: refreshedSession, error } = await supabase.auth.refreshSession();
    if (error) {
      // Log the error but don't throw - we'll let the request continue
      // This allows the user to be redirected to login if needed
      console.error('Session refresh failed:', error);
    } else {
      console.log('Session refreshed successfully for user:', refreshedSession?.user?.email);
    }
  } catch (error) {
    console.error('Unexpected error during session refresh:', error);
  }

  return response;
}
