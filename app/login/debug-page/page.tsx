'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Layout } from '../../../components/layout/Layout';
import { AuthForm } from '../../../components/ui/AuthForm';
import { supabase } from '../../../lib/supabase';

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic';

export default function LoginDebugPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [clientSession, setClientSession] = useState<any>(null);
  const [clientUser, setClientUser] = useState<any>(null);
  
  // Get the redirect URL from the query parameters
  const redirectUrl = searchParams.get('redirect') || '/account';
  
  // State for error handling
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  
  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toISOString()}: ${message}`]);
  };
  
  // Check if user is already logged in
  useEffect(() => {
    async function checkAuth() {
      setIsLoading(true);
      setError(null);
      
      try {
        addLog('Checking authentication status...');
        
        // Get session
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          addLog(`Session error: ${sessionError.message}`);
          setError('Authentication error: ' + sessionError.message);
          setIsLoading(false);
          return;
        }
        
        setClientSession(sessionData.session);
        addLog(`Session found: ${sessionData.session ? 'Yes' : 'No'}`);
        
        // Get user
        if (sessionData.session) {
          const { data: userData, error: userError } = await supabase.auth.getUser();
          
          if (userError) {
            addLog(`User error: ${userError.message}`);
            setError('Authentication error: ' + userError.message);
            setIsLoading(false);
            return;
          }
          
          setClientUser(userData.user);
          addLog(`User found: ${userData.user?.email}`);
          
          // Check if user is admin
          if (userData.user) {
            const { data: dbUserData, error: dbError } = await supabase
              .from('users')
              .select('is_admin')
              .eq('id', userData.user.id)
              .single();
            
            if (dbError) {
              addLog(`Database error: ${dbError.message}`);
            } else {
              addLog(`User is admin: ${dbUserData?.is_admin ? 'Yes' : 'No'}`);
            }
          }
        }
        
        setIsLoading(false);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        addLog(`Unexpected error: ${errorMessage}`);
        setError('Unexpected error: ' + errorMessage);
        setIsLoading(false);
      }
    }
    
    checkAuth();
  }, []);
  
  // Handle manual redirect
  const handleRedirect = () => {
    addLog(`Manually redirecting to: ${redirectUrl}`);
    router.push(redirectUrl);
  };
  
  // Handle sign out
  const handleSignOut = async () => {
    addLog('Signing out...');
    await supabase.auth.signOut();
    window.location.reload();
  };
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-8">Login Debug Page</h1>
          
          {/* Display error message if there is one */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <p className="font-bold">Error</p>
              <p>{error}</p>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              {isLoading ? (
                <div className="flex flex-col items-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
                  <p className="text-gray-600">Checking authentication status...</p>
                </div>
              ) : (
                <>
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold mb-2">Authentication Status</h2>
                    <div className="bg-gray-100 p-4 rounded-md">
                      <p><strong>Session:</strong> {clientSession ? 'Found' : 'Not found'}</p>
                      <p><strong>User:</strong> {clientUser ? clientUser.email : 'Not found'}</p>
                      <p><strong>Redirect URL:</strong> {redirectUrl}</p>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold mb-2">Actions</h2>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={handleRedirect}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        Manual Redirect
                      </button>
                      
                      <button
                        onClick={handleSignOut}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                      >
                        Sign Out
                      </button>
                      
                      <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                      >
                        Refresh Page
                      </button>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold mb-2">Session Details</h2>
                    <pre className="bg-gray-100 p-4 rounded-md overflow-auto max-h-60 text-xs">
                      {clientSession ? JSON.stringify(clientSession, null, 2) : 'No session found'}
                    </pre>
                  </div>
                  
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold mb-2">User Details</h2>
                    <pre className="bg-gray-100 p-4 rounded-md overflow-auto max-h-60 text-xs">
                      {clientUser ? JSON.stringify(clientUser, null, 2) : 'No user found'}
                    </pre>
                  </div>
                </>
              )}
            </div>
            
            <div>
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2">Login Form</h2>
                <AuthForm onSuccess={() => {
                  addLog('Login successful, reloading page...');
                  window.location.reload();
                }} />
              </div>
              
              <div>
                <h2 className="text-xl font-semibold mb-2">Debug Logs</h2>
                <div className="bg-gray-100 p-4 rounded-md overflow-auto max-h-96">
                  {logs.map((log, index) => (
                    <div key={index} className="text-xs font-mono mb-1">{log}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
