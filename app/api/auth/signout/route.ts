import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import logger from '../../../../lib/utils/logger';

/**
 * POST handler for server-side sign out
 */
export async function POST(request: NextRequest) {
  try {
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
    
    // Sign out with Supabase
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      logger.error('Sign out error:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    logger.log('Sign out successful');
    
    // Return success message
    return NextResponse.json({
      message: 'Sign out successful',
    });
  } catch (err) {
    logger.error('Unexpected error during sign out:', err);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
