import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from './utils/supabase/middleware';

/**
 * Debug middleware that allows access to admin pages
 * This is for debugging purposes only and should not be used in production
 */
export async function middleware(request: NextRequest) {
  // Call updateSession to refresh the Supabase auth session
  const response = await updateSession(request);
  
  // Get the pathname from the request
  const { pathname } = request.nextUrl;
  
  // For admin routes, always allow access
  if (pathname.startsWith('/admin')) {
    console.log('DEBUG MIDDLEWARE: Allowing access to admin page:', pathname);
    return response;
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
