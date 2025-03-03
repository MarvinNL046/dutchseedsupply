'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Card } from '../../../components/ui/card';

export default function AdminDebugPage() {
  const [error, setError] = useState<string | null>(null);
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
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
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
