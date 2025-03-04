import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { updateSession } from './utils/supabase/middleware';
import { getAdminEmails } from './utils/admin-config';

// DEBUG MODE - Only enabled in development environment
// This will bypass all authentication checks and allow access to the admin panel
const DEBUG_MODE = process.env.NODE_ENV === 'development';

// List of admin email addresses that should always have access
const ADMIN_EMAILS = [
  'marvinsmit1988@gmail.com',
  // Add other admin emails here
];

// Debug flag to disable admin redirects
const DISABLE_ADMIN_REDIRECTS = true;

/**
 * Middleware function for handling authentication and admin access
 */
export async function middleware(request: NextRequest) {
  // Add a debug header to track middleware execution
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });
  response.headers.set('X-Middleware-Debug', 'Executed at ' + new Date().toISOString());
  
  // Call updateSession to refresh the Supabase auth session
  const sessionResponse = await updateSession(request);
  
  // Copy cookies from sessionResponse to our response
  sessionResponse.cookies.getAll().forEach(cookie => {
    response.cookies.set(cookie.name, cookie.value, cookie);
  });
  
  // Get the pathname from the request
  const { pathname } = request.nextUrl;
  
  // For admin routes, check if user is authenticated and has admin role
  if (pathname.startsWith('/admin')) {
    // Add debug header for admin routes
    response.headers.set('X-Admin-Route-Debug', 'Admin route detected: ' + pathname);
    
    // If debug mode is enabled, allow access to the admin panel
    if (DEBUG_MODE) {
      console.log('DEBUG MODE ENABLED in middleware - Bypassing authentication checks');
      response.headers.set('X-Admin-Debug-Mode', 'Enabled');
      return response;
    }
    
    // Special case for debug pages
    if (pathname.includes('debug')) {
      console.log('Debug page detected, allowing access: ' + pathname);
      response.headers.set('X-Debug-Page', 'Access allowed');
      return response;
    }
    
    // Create a Supabase client for this specific middleware invocation
    let user;
    let authError = null;
    try {
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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

      const { data: { user: authUser }, error } = await supabase.auth.getUser();
      user = authUser;
      authError = error;
    } catch (error) {
      console.error('Error getting user in middleware:', error);
      response.headers.set('X-Auth-Error', String(error));
      // Continue with user as undefined
    }
    
    // If user is not authenticated, redirect to login
    if (!user) {
      if (DISABLE_ADMIN_REDIRECTS) {
        console.log('Admin redirects disabled, allowing access despite no user');
        response.headers.set('X-Auth-Status', 'No user, but redirects disabled');
        return response;
      }
      
      console.log('No user found, redirecting to login');
      response.headers.set('X-Auth-Status', 'No user, redirecting to login');
      const redirectUrl = new URL('/login/debug-page', request.url);
      redirectUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(redirectUrl);
    }
    
    // Add user info to response headers for debugging
    response.headers.set('X-Auth-User', user.email || 'No email');
    
    // Check if user's email is in the hardcoded admin list
    if (user.email && ADMIN_EMAILS.includes(user.email)) {
      console.log('User is in hardcoded admin list, allowing access:', user.email);
      response.headers.set('X-Admin-Status', 'Admin by hardcoded email');
      return response;
    }

    // Check if user's email is in the environment variable admin list
    const adminEmails = getAdminEmails();
    if (user.email && adminEmails.includes(user.email)) {
      console.log('User is in environment admin list, allowing access:', user.email);
      response.headers.set('X-Admin-Status', 'Admin by environment email');
      return response;
    }

    try {
      // Create a Supabase client for this specific middleware invocation
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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

      // Check if user has admin role in database
      const { data: userData, error } = await supabase
        .from('users')
        .select('is_admin')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error checking admin status in middleware:', error);
        response.headers.set('X-DB-Error', error.message);
        // If there's an error, we'll fall through to the redirect
      } else if (userData?.is_admin) {
        console.log('User is admin in database, allowing access:', user.email);
        response.headers.set('X-Admin-Status', 'Admin by database');
        return response;
      } else {
        response.headers.set('X-Admin-Status', 'Not admin in database');
      }
    } catch (error) {
      console.error('Unexpected error in middleware admin check:', error);
      response.headers.set('X-Unexpected-Error', String(error));
      // If there's an error, we'll fall through to the redirect
    }

    // If we get here, the user is not an admin, redirect to homepage
    if (DISABLE_ADMIN_REDIRECTS) {
      console.log('Admin redirects disabled, allowing access despite not being admin');
      response.headers.set('X-Auth-Override', 'Not admin, but redirects disabled');
      return response;
    }
    
    console.log('User is not an admin, redirecting to homepage');
    response.headers.set('X-Auth-Redirect', 'Not admin, redirecting to homepage');
    return NextResponse.redirect(new URL('/', request.url));
  }

  return response;
}

// Only run middleware on specific paths
// Exclude static assets, images, and other files
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|images|locales|robots.txt|sitemap.xml).*)',
  ],
};
