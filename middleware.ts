import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { updateSession } from './utils/supabase/middleware';

// Only enable debug mode in development or if explicitly enabled
const DEBUG_MODE = process.env.ADMIN_DEBUG_MODE === 'true' || process.env.NODE_ENV === 'development';

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
    
    // Special case for debug pages
    if (pathname.includes('debug')) {
      console.log('Debug page detected, allowing access: ' + pathname);
      return response;
    }
    
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

    // Get the user from the session
    const { data: { user }, error } = await supabase.auth.getUser();
    
    // If there's an error or no user, redirect to login
    if (error || !user) {
      console.log('No user found, redirecting to login');
      
      // IMPORTANT: Check if we're coming from the login page to prevent infinite loops
      const referer = request.headers.get('referer') || '';
      if (referer.includes('/login')) {
        console.log('Coming from login page, allowing access to prevent infinite loop');
        return response;
      }
      
      // Add the redirect URL as a query parameter
      const redirectUrl = new URL('/login', request.url);
      redirectUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(redirectUrl);
    }
    
    // Check if user has admin role in database
    const { data: userData, error: dbError } = await supabase
      .from('users')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (dbError) {
      console.error('Error checking admin status in middleware:', dbError);
      // If there's an error, we'll fall through to the redirect
    } else if (userData?.is_admin) {
      console.log('User is admin in database, allowing access:', user.email);
      return response;
    }

    // If we get here, the user is not an admin, redirect to homepage
    console.log('User is not an admin, redirecting to homepage');
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
