'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Card } from '../../../components/ui/card';

export default function AdminSimplePage() {
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
        <p className="text-gray-600">Loading simple page...</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Admin Simple Page</h1>
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
            <CheckCircle className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-semibold">Simple Page Loaded Successfully</h2>
        </div>
        
        <p className="mb-4">
          This is a simple admin page that doesn&apos;t rely on any server-side components or database connections.
          If you can see this page, it means that the basic admin authentication and routing is working correctly.
        </p>
        
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md">
          <h3 className="font-medium mb-2">Page Information:</h3>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>Page loaded at: {new Date().toLocaleString()}</li>
            <li>Client-side rendering: Yes</li>
            <li>Server-side components: No</li>
            <li>Database connections: No</li>
          </ul>
        </div>
      </Card>
      
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Navigation Options</h2>
        <div className="space-y-4">
          <Link href="/admin/debug-page" className="block p-4 border rounded-md hover:bg-gray-50 dark:hover:bg-gray-800">
            Go to Debug Page
          </Link>
          <Link href="/admin" className="block p-4 border rounded-md hover:bg-gray-50 dark:hover:bg-gray-800">
            Go to Admin Dashboard
          </Link>
          <Link href="/" className="block p-4 border rounded-md hover:bg-gray-50 dark:hover:bg-gray-800">
            Go to Homepage
          </Link>
        </div>
      </Card>
    </div>
  );
}
