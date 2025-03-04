import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { updateSession } from './utils/supabase/middleware';
import { getAdminEmails } from './utils/admin-config';

// List of admin email addresses that should always have access
const ADMIN_EMAILS = [
  'marvinsmit1988@gmail.com',
  // Add other admin emails here
];

/**
 * Middleware function for handling authentication and admin access
 * This version is optimized for production use and prevents infinite redirect loops
 */
export async function middleware(request: NextRequest) {
  // Call updateSession to refresh the Supabase auth session
  const response = await updateSession(request);
  
  // Get the pathname from the request
  const { pathname } = request.nextUrl;
  
  // For admin routes, check if user is authenticated and has admin role
  if (pathname.startsWith('/admin')) {
    // Special case for debug pages - always allow access
    if (pathname.includes('debug')) {
      console.log('Debug page detected, allowing access: ' + pathname);
      return response;
    }
    
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
