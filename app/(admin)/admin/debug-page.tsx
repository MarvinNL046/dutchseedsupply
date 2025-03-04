'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AlertCircle, ArrowLeft, Bug, Database, Server, User, Globe, Shield } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Card } from '../../../components/ui/card';

export default function AdminDebugPage() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [browserInfo, setBrowserInfo] = useState<any>({});
  const [networkInfo, setNetworkInfo] = useState<any>({});
  const [consoleMessages, setConsoleMessages] = useState<string[]>([]);
  
  // Capture console messages
  useEffect(() => {
    const originalConsoleLog = console.log;
    const originalConsoleError = console.error;
    const originalConsoleWarn = console.warn;
    
    const messages: string[] = [];
    
    console.log = (...args) => {
      messages.push(`[LOG] ${args.map(arg => String(arg)).join(' ')}`);
      setConsoleMessages([...messages]);
      originalConsoleLog(...args);
    };
    
    console.error = (...args) => {
      messages.push(`[ERROR] ${args.map(arg => String(arg)).join(' ')}`);
      setConsoleMessages([...messages]);
      originalConsoleError(...args);
    };
    
    console.warn = (...args) => {
      messages.push(`[WARN] ${args.map(arg => String(arg)).join(' ')}`);
      setConsoleMessages([...messages]);
      originalConsoleWarn(...args);
    };
    
    return () => {
      console.log = originalConsoleLog;
      console.error = originalConsoleError;
      console.warn = originalConsoleWarn;
    };
  }, []);
  
  useEffect(() => {
    // Collect browser information
    setBrowserInfo({
      userAgent: navigator.userAgent,
      language: navigator.language,
      cookiesEnabled: navigator.cookieEnabled,
      localStorage: typeof localStorage !== 'undefined',
      sessionStorage: typeof sessionStorage !== 'undefined',
    });
    
    // Collect network information
    setNetworkInfo({
      online: navigator.onLine,
      protocol: window.location.protocol,
      hostname: window.location.hostname,
      pathname: window.location.pathname,
    });
    
    // Log some debug information
    console.log('Debug page loaded');
    console.log('Current URL:', window.location.href);
    
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
      console.log('Debug page finished loading');
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
        <p className="text-gray-600">Loading debug information...</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Admin Debug Page</h1>
        <Link href="/admin">
          <Button variant="outline" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>
      </div>
      
      <Card className="p-6">
        <div className="flex items-center mb-4 text-green-600">
          <div className="bg-green-100 p-2 rounded-full mr-3">
            <AlertCircle className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-semibold">Admin Access Successful</h2>
        </div>
        
        <p className="mb-4">
          You have successfully accessed the admin area. This debug page doesn&apos;t rely on database connections
          and should always load correctly.
        </p>
        
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md">
          <h3 className="font-medium mb-2">Debug Information:</h3>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>Page loaded successfully</li>
            <li>Admin authentication passed</li>
            <li>Current time: {new Date().toLocaleString()}</li>
            <li>Environment: {process.env.NODE_ENV}</li>
          </ul>
        </div>
      </Card>
      
      <Card className="p-6">
        <div className="flex items-center mb-4">
          <div className="bg-blue-100 p-2 rounded-full mr-3">
            <Bug className="h-6 w-6 text-blue-600" />
          </div>
          <h2 className="text-xl font-semibold">Browser Information</h2>
        </div>
        
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md mb-4">
          <h3 className="font-medium mb-2">Browser Details:</h3>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>User Agent: {browserInfo.userAgent}</li>
            <li>Language: {browserInfo.language}</li>
            <li>Cookies Enabled: {browserInfo.cookiesEnabled ? 'Yes' : 'No'}</li>
            <li>Local Storage: {browserInfo.localStorage ? 'Available' : 'Not Available'}</li>
            <li>Session Storage: {browserInfo.sessionStorage ? 'Available' : 'Not Available'}</li>
          </ul>
        </div>
        
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md">
          <h3 className="font-medium mb-2">Network Details:</h3>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>Online: {networkInfo.online ? 'Yes' : 'No'}</li>
            <li>Protocol: {networkInfo.protocol}</li>
            <li>Hostname: {networkInfo.hostname}</li>
            <li>Pathname: {networkInfo.pathname}</li>
          </ul>
        </div>
      </Card>
      
      <Card className="p-6">
        <div className="flex items-center mb-4">
          <div className="bg-amber-100 p-2 rounded-full mr-3">
            <Server className="h-6 w-6 text-amber-600" />
          </div>
          <h2 className="text-xl font-semibold">Console Messages</h2>
        </div>
        
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md overflow-auto max-h-60">
          {consoleMessages.length > 0 ? (
            <ul className="space-y-1 text-sm font-mono">
              {consoleMessages.map((message, index) => (
                <li key={index} className={`
                  ${message.includes('[ERROR]') ? 'text-red-600' : ''}
                  ${message.includes('[WARN]') ? 'text-amber-600' : ''}
                  ${message.includes('[LOG]') ? 'text-gray-800 dark:text-gray-200' : ''}
                `}>
                  {message}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No console messages captured yet.</p>
          )}
        </div>
      </Card>
      
      <Card className="p-6">
        <div className="flex items-center mb-4">
          <div className="bg-green-100 p-2 rounded-full mr-3">
            <Shield className="h-6 w-6 text-green-600" />
          </div>
          <h2 className="text-xl font-semibold">Authentication Test</h2>
        </div>
        
        <p className="mb-4">
          This section tests if your browser can make authenticated requests without using Supabase directly.
        </p>
        
        <div className="flex space-x-4">
          <Button 
            onClick={() => {
              console.log('Testing cookies...');
              try {
                document.cookie = "test_cookie=1; path=/; SameSite=Strict";
                const hasCookie = document.cookie.includes('test_cookie');
                console.log('Cookie test result:', hasCookie ? 'Success' : 'Failed');
                alert(hasCookie ? 'Cookie test successful!' : 'Cookie test failed!');
              } catch (err) {
                console.error('Cookie test error:', err);
                alert('Cookie test error: ' + String(err));
              }
            }}
          >
            Test Cookies
          </Button>
          
          <Button 
            onClick={() => {
              console.log('Testing local storage...');
              try {
                localStorage.setItem('test_storage', '1');
                const hasStorage = localStorage.getItem('test_storage') === '1';
                localStorage.removeItem('test_storage');
                console.log('Storage test result:', hasStorage ? 'Success' : 'Failed');
                alert(hasStorage ? 'Storage test successful!' : 'Storage test failed!');
              } catch (err) {
                console.error('Storage test error:', err);
                alert('Storage test error: ' + String(err));
              }
            }}
          >
            Test Storage
          </Button>
        </div>
      </Card>
      
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Admin Navigation</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link href="/admin" className="block p-4 border rounded-md hover:bg-gray-50 dark:hover:bg-gray-800">
            Dashboard
          </Link>
          <Link href="/admin/products" className="block p-4 border rounded-md hover:bg-gray-50 dark:hover:bg-gray-800">
            Products
          </Link>
          <Link href="/admin/categories" className="block p-4 border rounded-md hover:bg-gray-50 dark:hover:bg-gray-800">
            Categories
          </Link>
          <Link href="/admin/orders" className="block p-4 border rounded-md hover:bg-gray-50 dark:hover:bg-gray-800">
            Orders
          </Link>
          <Link href="/admin/users" className="block p-4 border rounded-md hover:bg-gray-50 dark:hover:bg-gray-800">
            Users
          </Link>
          <Link href="/admin/blog" className="block p-4 border rounded-md hover:bg-gray-50 dark:hover:bg-gray-800">
            Blog
          </Link>
        </div>
      </Card>
    </div>
  );
}
