"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../../lib/supabase";

export default function AuthDebugPage() {
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [authChecks, setAuthChecks] = useState<string[]>([]);

  useEffect(() => {
    async function checkAuth() {
      try {
        setLoading(true);
        setAuthChecks(prev => [...prev, "Starting auth check"]);

        // Get session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
          setError(`Session error: ${sessionError.message}`);
          setAuthChecks(prev => [...prev, `Session error: ${sessionError.message}`]);
          return;
        }

        if (!session) {
          setError("No session found. Please log in.");
          setAuthChecks(prev => [...prev, "No session found"]);
          return;
        }

        setAuthChecks(prev => [...prev, `Session found for user: ${session.user.email}`]);
        setUser(session.user);

        // Check if user is admin
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("is_admin")
          .eq("id", session.user.id)
          .single();

        if (userError) {
          setError(`User data error: ${userError.message}`);
          setAuthChecks(prev => [...prev, `User data error: ${userError.message}`]);
          return;
        }

        setIsAdmin(userData?.is_admin || false);
        setAuthChecks(prev => [...prev, `Admin status: ${userData?.is_admin ? "Yes" : "No"}`]);

        // Test is_admin function
        const { data: functionData, error: functionError } = await supabase
          .rpc("is_admin", { uid: session.user.id });

        if (functionError) {
          setError(`is_admin function error: ${functionError.message}`);
          setAuthChecks(prev => [...prev, `is_admin function error: ${functionError.message}`]);
          return;
        }

        setAuthChecks(prev => [...prev, `is_admin function result: ${functionData ? "Yes" : "No"}`]);

        // Check RLS policies
        const { data: policiesData, error: policiesError } = await supabase
          .from("users")
          .select("*")
          .limit(1);

        if (policiesError) {
          setError(`RLS policy error: ${policiesError.message}`);
          setAuthChecks(prev => [...prev, `RLS policy error: ${policiesError.message}`]);
          return;
        }

        setAuthChecks(prev => [...prev, "RLS policies check passed"]);

      } catch (e: any) {
        setError(`Unexpected error: ${e.message}`);
        setAuthChecks(prev => [...prev, `Unexpected error: ${e.message}`]);
      } finally {
        setLoading(false);
      }
    }

    checkAuth();
  }, []); // Empty dependency array since we're using functional updates

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Auth Debug Page</h1>
      
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p><strong>Error:</strong> {error}</p>
        </div>
      ) : (
        <div>
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            <p>Authentication successful!</p>
          </div>
          
          <div className="mb-4">
            <h2 className="text-xl font-semibold mb-2">User Information</h2>
            <p><strong>Email:</strong> {user?.email}</p>
            <p><strong>ID:</strong> {user?.id}</p>
            <p><strong>Is Admin:</strong> {isAdmin ? "Yes" : "No"}</p>
          </div>
        </div>
      )}
      
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-2">Auth Check Log</h2>
        <div className="bg-gray-100 p-4 rounded">
          <ul className="list-disc pl-5">
            {authChecks.map((check, index) => (
              <li key={index}>{check}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
