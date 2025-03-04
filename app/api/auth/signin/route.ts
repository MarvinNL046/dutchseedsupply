import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import logger from '../../../../lib/utils/logger';

/**
 * POST handler for server-side sign in
 * This prevents passwords from being visible in network requests
 */
export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const { email, password } = await request.json();
    
    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }
    
    // Create a Supabase client for this specific request
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookies().get(name)?.value;
          },
          set(name: string, value: string, options) {
            cookies().set({ name, value, ...options });
          },
          remove(name: string, options) {
            cookies().set({ name, value: '', ...options });
          },
        },
      }
    );
    
    // Sign in with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      logger.error('Sign in error:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }
    
    logger.log('Sign in successful for user:', email);
    
    // Return the user data (but not the session token, which is handled by cookies)
    return NextResponse.json({
      user: data.user,
      message: 'Sign in successful',
    });
  } catch (err) {
    logger.error('Unexpected error during sign in:', err);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
