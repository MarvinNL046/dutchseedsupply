import { redirect } from 'next/navigation';
import { supabase } from './supabase';
import { getCurrentUser } from './auth';
// Import logger or create a simple console logger if it fails
let logger: any;
try {
  logger = require('./utils/logger').default;
} catch (error) {
  logger = {
    log: console.log,
    error: console.error,
    warn: console.warn,
    info: console.info
  };
}
import { getAdminEmails } from '../utils/admin-config';

// DEBUG MODE - Only enabled in development environment
// This will bypass all authentication checks and allow access to the admin panel
const DEBUG_MODE = process.env.NODE_ENV === 'development';

// List of admin email addresses that should always have access
const ADMIN_EMAILS = [
  'marvinsmit1988@gmail.com',
  // Add other admin emails here
];

/**
 * Server-side admin authentication check for App Router
 * 
 * This function checks if the current user is an admin and redirects to the homepage if not.
 * It should be used in server components like app/(admin)/layout.tsx
 * 
 * @returns An object with user, isAdmin, and isAdminByEmail properties
 */
export async function checkAdminAuth() {
  console.log('checkAdminAuth called');
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
    const { user, error } = await getCurrentUser();
    
    // If no user is found in server-side session, redirect to login
    if (!user || error) {
      logger.log('No user found in server-side session, redirecting to login');
      redirect('/login');
    }
    
    // Log the user for debugging
    logger.log('User found in server-side session:', { email: user.email, id: user.id });
    
    // Check if user's email is in the hardcoded admin list
    if (user.email && ADMIN_EMAILS.includes(user.email)) {
      logger.log('User is in hardcoded admin list, allowing access:', user.email);
      return {
        isAdmin: true,
        user,
        isAdminByEmail: true,
      };
    }
    
    // Check if user's email is in the environment variable admin list
    const adminEmails = getAdminEmails();
    if (user.email && adminEmails.includes(user.email)) {
      logger.log('User is in environment admin list, allowing access:', user.email);
      return {
        isAdmin: true,
        user,
        isAdminByEmail: true,
      };
    }
    
    // Check if user is admin in the database
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
    return {
      isAdmin: true,
      user,
      isAdminByEmail: false,
    };
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
