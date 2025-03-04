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

/**
 * Middleware function for handling authentication and admin access
 */
export async function middleware(request: NextRequest) {
  // Call updateSession to refresh the Supabase auth session
  const response = await updateSession(request);
  
  // Get the pathname from the request
  const { pathname } = request.nextUrl;
  
  // For admin routes, check if user is authenticated and has admin role
  if (pathname.startsWith('/admin')) {
    // If debug mode is enabled, allow access to the admin panel
    if (DEBUG_MODE) {
      console.log('DEBUG MODE ENABLED in middleware - Bypassing authentication checks');
      return response;
    }

    // Create a Supabase client for this specific middleware invocation
    let user;
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

      const { data: { user: authUser } } = await supabase.auth.getUser();
      user = authUser;
    } catch (error) {
      console.error('Error getting user in middleware:', error);
      // Continue with user as undefined
    }
    
    // If user is not authenticated, redirect to login
    if (!user) {
      const redirectUrl = new URL('/login', request.url);
      redirectUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(redirectUrl);
    }

    // Check if user's email is in the hardcoded admin list
    if (user.email && ADMIN_EMAILS.includes(user.email)) {
      console.log('User is in hardcoded admin list, allowing access:', user.email);
      return response;
    }

    // Check if user's email is in the environment variable admin list
    const adminEmails = getAdminEmails();
    if (user.email && adminEmails.includes(user.email)) {
      console.log('User is in environment admin list, allowing access:', user.email);
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
        // If there's an error, we'll fall through to the redirect
      } else if (userData?.is_admin) {
        console.log('User is admin in database, allowing access:', user.email);
        return response;
      }
    } catch (error) {
      console.error('Unexpected error in middleware admin check:', error);
      // If there's an error, we'll fall through to the redirect
    }

    // If we get here, the user is not an admin, redirect to homepage
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
