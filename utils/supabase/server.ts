import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { redirect } from 'next/navigation';
import logger from '../../lib/utils/logger';
import { getAdminEmails } from '../admin-config';

// DEBUG MODE - Temporarily enabled in all environments
// This will bypass all authentication checks and allow access to the admin panel
const DEBUG_MODE = true; // process.env.NODE_ENV === 'development';

export async function createClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // This will throw in middleware, but we can safely ignore it
            logger.error('Error setting cookie in server component:', error);
          }
        },
        remove(name: string, options) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch (error) {
            // This will throw in middleware, but we can safely ignore it
            logger.error('Error removing cookie in server component:', error);
          }
        },
      },
    }
  );
}

export async function getServerUser() {
  const supabase = await createClient();
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  
  if (sessionError || !session) {
    logger.log('No server-side session found:', { sessionError });
    return { user: null, error: sessionError };
  }
  
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError) {
    logger.error('Error getting server-side user:', userError);
    return { user: null, error: userError };
  }
  
  logger.log('Found user with server client:', user?.email);
  return { user, error: null };
}

export async function checkAdminAuth() {
  console.log('Server-side checkAdminAuth called');
  try {
    // If debug mode is enabled, allow access to the admin panel
    if (DEBUG_MODE) {
      console.log('DEBUG MODE ENABLED - Bypassing authentication checks');
      logger.log('DEBUG MODE ENABLED - Bypassing authentication checks');
      return {
        isAdmin: true,
        user: {
          id: 'debug-user-id',
          email: 'marvinsmit1988@gmail.com',
          user_metadata: {
            full_name: 'Debug Admin User',
          },
        },
        isAdminByEmail: true,
        debugMode: true,
      };
    }
    
    // Try to get the user from the server-side session
    const { user, error } = await getServerUser();
    
    // If no user is found in server-side session, redirect to login
    if (!user || error) {
      logger.log('No user found in server-side session, redirecting to login');
      redirect('/login');
    }
    
    // Log the user for debugging
    logger.log('User found in server-side session:', { email: user.email, id: user.id });
    
    // Check if user's email is in the admin list from environment variables
    const adminEmails = getAdminEmails();
    if (user.email && adminEmails.includes(user.email)) {
      logger.log('User is in admin email list, allowing access');
      return { isAdmin: true, user, isAdminByEmail: true };
    }
    
    // Check if user is admin in the database
    const supabase = await createClient();
    const { data: userData, error: dbError } = await supabase
      .from('users')
      .select('is_admin')
      .eq('id', user.id)
      .single();
    
    logger.log('Server-side admin check:', { userData, dbError, userId: user.id });
    
    // If there's an error or user is not admin, redirect to homepage
    if (dbError || !userData?.is_admin) {
      logger.log('User is not an admin or error occurred, redirecting to homepage');
      redirect('/');
    }
    
    // User is an admin, return the user object
    return { isAdmin: true, user, isAdminByEmail: false };
  } catch (error) {
    logger.error('Unexpected error in checkAdminAuth:', error);
    
    // For unexpected errors in production, redirect to homepage for safety
    // In debug mode, allow access with a warning
    if (DEBUG_MODE) {
      logger.log('DEBUG MODE ENABLED - Allowing access despite error');
      return {
        isAdmin: true,
        user: {
          id: 'debug-user-id',
          email: 'marvinsmit1988@gmail.com',
          user_metadata: {
            full_name: 'Debug Admin User',
          },
        },
        isAdminByEmail: true,
        debugMode: true,
        error: String(error),
      };
    }
    
    redirect('/');
  }
}
