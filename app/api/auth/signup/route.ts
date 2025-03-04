import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import logger from '../../../../lib/utils/logger';

/**
 * POST handler for server-side sign up
 * This prevents passwords from being visible in network requests
 */
export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const { email, password, full_name } = await request.json();
    
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
    
    // Sign up with Supabase
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: full_name || '',
        },
      },
    });
    
    if (error) {
      logger.error('Sign up error:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    
    logger.log('Sign up successful for user:', email);
    
    // Return the user data
    return NextResponse.json({
      user: data.user,
      message: 'Sign up successful. Please check your email for confirmation.',
    });
  } catch (err) {
    logger.error('Unexpected error during sign up:', err);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
