import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

/**
 * API route for on-demand revalidation of pages
 * 
 * Example usage:
 * POST /api/revalidate?secret=your_secret_token&path=/products/product-slug
 */
export const dynamic = 'force-dynamic';
export async function POST(request: NextRequest) {
  try {
    // Check for secret to confirm this is a valid request
    const secret = request.nextUrl.searchParams.get('secret');
    const path = request.nextUrl.searchParams.get('path');
    
    if (!secret || secret !== process.env.REVALIDATION_TOKEN) {
      return NextResponse.json(
        { message: 'Invalid token' },
        { status: 401 }
      );
    }
    
    if (!path) {
      return NextResponse.json(
        { message: 'Path is required' },
        { status: 400 }
      );
    }
    
    // Revalidate the specific path
    revalidatePath(path);
    
    return NextResponse.json({
      revalidated: true,
      message: `Path ${path} revalidated successfully`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error revalidating path:', error);
    return NextResponse.json(
      { message: 'Error revalidating path', error: String(error) },
      { status: 500 }
    );
  }
}

/**
 * API route for checking revalidation status
 */
export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Revalidation API is active',
    usage: 'Send a POST request with secret and path parameters to revalidate a page',
    example: 'POST /api/revalidate?secret=your_secret_token&path=/products/product-slug',
    timestamp: new Date().toISOString(),
  });
}
