import { createClient } from '../../../../utils/supabase/server';
import { getAdminEmails } from '../../../../utils/admin-config';

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic';

export default async function ServerDebugPage() {
  // Get environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'Not set';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set (hidden for security)' : 'Not set';
  const nodeEnv = process.env.NODE_ENV || 'Not set';
  
  // Get admin emails from config
  const adminEmails = getAdminEmails();
  const hardcodedAdminEmails = [
    'marvinsmit1988@gmail.com',
    // Add other admin emails here
  ];
  
  // Create Supabase client
  let sessionData = null;
  let userData = null;
  let dbUserData = null;
  let error = null;
  
  try {
    const supabase = await createClient();
    
    // Get session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      error = `Session error: ${sessionError.message}`;
    } else {
      sessionData = session;
      
      // Get user
      if (session) {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          error = `User error: ${userError.message}`;
        } else {
          userData = user;
          
          // Get user data from database
          if (user) {
            const { data, error: dbError } = await supabase
              .from('users')
              .select('*')
              .eq('id', user.id)
              .single();
            
            if (dbError) {
              error = `Database error: ${dbError.message}`;
            } else {
              dbUserData = data;
            }
          }
        }
      }
    }
  } catch (e) {
    error = `Unexpected error: ${e instanceof Error ? e.message : String(e)}`;
  }
  
  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">Server-side Authentication Debug</h1>
      
      {error && (
        <div className="p-4 mb-6 bg-red-100 text-red-700 rounded-md">
          <h2 className="font-bold">Error:</h2>
          <p>{error}</p>
        </div>
      )}
      
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-2">Environment:</h2>
          <div className="bg-gray-100 p-4 rounded-md">
            <p><strong>NODE_ENV:</strong> {nodeEnv}</p>
            <p><strong>NEXT_PUBLIC_SUPABASE_URL:</strong> {supabaseUrl}</p>
            <p><strong>NEXT_PUBLIC_SUPABASE_ANON_KEY:</strong> {supabaseAnonKey}</p>
          </div>
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-2">Admin Configuration:</h2>
          <div className="bg-gray-100 p-4 rounded-md">
            <p><strong>Hardcoded Admin Emails:</strong></p>
            <ul className="list-disc pl-6">
              {hardcodedAdminEmails.map((email) => (
                <li key={email}>{email}</li>
              ))}
            </ul>
            
            <p className="mt-2"><strong>Environment Admin Emails:</strong></p>
            <ul className="list-disc pl-6">
              {adminEmails.length > 0 ? (
                adminEmails.map((email) => (
                  <li key={email}>{email}</li>
                ))
              ) : (
                <li>None configured</li>
              )}
            </ul>
          </div>
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-2">Server-side Session:</h2>
          <pre className="bg-gray-100 p-4 rounded-md overflow-auto max-h-60">
            {sessionData ? JSON.stringify(sessionData, null, 2) : 'No session found'}
          </pre>
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-2">Server-side User:</h2>
          <pre className="bg-gray-100 p-4 rounded-md overflow-auto max-h-60">
            {userData ? JSON.stringify(userData, null, 2) : 'No user found'}
          </pre>
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-2">Database User Data:</h2>
          <pre className="bg-gray-100 p-4 rounded-md overflow-auto max-h-60">
            {dbUserData ? JSON.stringify(dbUserData, null, 2) : 'No database user data found'}
          </pre>
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-2">Admin Status:</h2>
          <div className="bg-gray-100 p-4 rounded-md">
            {userData ? (
              <>
                <p>
                  <strong>Is Admin by Email (Hardcoded):</strong>{' '}
                  {userData.email && hardcodedAdminEmails.includes(userData.email) ? 'Yes' : 'No'}
                </p>
                <p>
                  <strong>Is Admin by Email (Environment):</strong>{' '}
                  {userData.email && adminEmails.includes(userData.email) ? 'Yes' : 'No'}
                </p>
                <p>
                  <strong>Is Admin by Database:</strong>{' '}
                  {dbUserData?.is_admin ? 'Yes' : 'No'}
                </p>
              </>
            ) : (
              <p>No user found to check admin status</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
