'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';

export default function AuthDebugPage() {
  const [clientSession, setClientSession] = useState<any>(null);
  const [clientUser, setClientUser] = useState<any>(null);
  const [clientError, setClientError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      setIsLoading(true);
      try {
        // Get session
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          setClientError(`Session error: ${sessionError.message}`);
          setIsLoading(false);
          return;
        }
        
        setClientSession(sessionData.session);
        
        // Get user
        if (sessionData.session) {
          const { data: userData, error: userError } = await supabase.auth.getUser();
          
          if (userError) {
            setClientError(`User error: ${userError.message}`);
            setIsLoading(false);
            return;
          }
          
          setClientUser(userData.user);
        }
        
        setIsLoading(false);
      } catch (error) {
        setClientError(`Unexpected error: ${error instanceof Error ? error.message : String(error)}`);
        setIsLoading(false);
      }
    }
    
    checkAuth();
  }, []);

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">Authentication Debug Page</h1>
      
      {isLoading ? (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {clientError && (
            <div className="p-4 bg-red-100 text-red-700 rounded-md">
              <h2 className="font-bold">Error:</h2>
              <p>{clientError}</p>
            </div>
          )}
          
          <div>
            <h2 className="text-xl font-semibold mb-2">Client-side Session:</h2>
            <pre className="bg-gray-100 p-4 rounded-md overflow-auto max-h-60">
              {clientSession ? JSON.stringify(clientSession, null, 2) : 'No session found'}
            </pre>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-2">Client-side User:</h2>
            <pre className="bg-gray-100 p-4 rounded-md overflow-auto max-h-60">
              {clientUser ? JSON.stringify(clientUser, null, 2) : 'No user found'}
            </pre>
          </div>
          
          <div className="flex space-x-4">
            <button
              onClick={async () => {
                await supabase.auth.signOut();
                window.location.href = '/';
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Sign Out
            </button>
            
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Refresh
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
