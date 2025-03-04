'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Layout } from '../../components/layout/Layout';
import { AuthForm } from '../../components/ui/AuthForm';
import { getCurrentUser } from '../../lib/auth';

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic';

// Wrapper component that uses searchParams
function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  
  // Get the redirect URL from the query parameters
  const redirectUrl = searchParams.get('redirect') || '/account';
  
  // State for error handling
  const [error, setError] = useState<string | null>(null);
  
  // Check if user is already logged in
  useEffect(() => {
    async function checkAuth() {
      setIsLoading(true);
      setError(null);
      
      try {
        console.log('Checking authentication status...');
        const { user, error: authError } = await getCurrentUser();
        
        if (authError) {
          console.error('Error getting current user:', authError);
          setError('Authentication error: ' + (authError.message || 'Unknown error'));
          setIsLoading(false);
          return;
        }
        
        if (user) {
          console.log('User is authenticated, redirecting to:', redirectUrl);
          // User is already logged in, redirect to the redirect URL
          router.push(redirectUrl);
        } else {
          console.log('User is not authenticated, showing login form');
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Unexpected error in checkAuth:', err);
        setError('Unexpected error: ' + (err instanceof Error ? err.message : 'Unknown error'));
        setIsLoading(false);
      }
    }
    
    checkAuth();
  }, [router, redirectUrl]);
  
  // Handle successful login
  const handleLoginSuccess = () => {
    router.push(redirectUrl);
  };
  
  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-3xl font-bold text-center mb-8">Account Login</h1>
      
      {/* Display error message if there is one */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      )}
      
      {isLoading ? (
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
          <p className="text-gray-600">Checking authentication status...</p>
        </div>
      ) : (
        <>
          <AuthForm onSuccess={handleLoginSuccess} />
          
          <div className="mt-8 text-center">
            <p className="text-gray-600">
              By creating an account, you can:
            </p>
            <ul className="mt-2 text-left list-disc pl-8">
              <li>Track your orders</li>
              <li>Earn and redeem loyalty points</li>
              <li>Save your shipping information</li>
              <li>Checkout faster</li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
}

// Loading fallback for Suspense
function LoginFallback() {
  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-3xl font-bold text-center mb-8">Account Login</h1>
      <div className="flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    </div>
  );
}

// Main component with Suspense
export default function LoginPage() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <Suspense fallback={<LoginFallback />}>
          <LoginContent />
        </Suspense>
      </div>
    </Layout>
  );
}
