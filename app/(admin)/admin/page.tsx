'use client';

import { useState, useEffect } from 'react';
import { Card } from '../../../components/ui/card';

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-2">Products</h2>
            <p className="text-4xl font-bold text-primary">42</p>
            <p className="text-sm text-muted-foreground mt-2">Total products in the database</p>
          </Card>
          
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-2">Orders</h2>
            <p className="text-4xl font-bold text-primary">18</p>
            <p className="text-sm text-muted-foreground mt-2">Orders in the last 30 days</p>
          </Card>
          
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-2">Users</h2>
            <p className="text-4xl font-bold text-primary">156</p>
            <p className="text-sm text-muted-foreground mt-2">Registered users</p>
          </Card>
          
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-2">Revenue</h2>
            <p className="text-4xl font-bold text-primary">€4,285</p>
            <p className="text-sm text-muted-foreground mt-2">Revenue in the last 30 days</p>
          </Card>
          
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-2">Blog Posts</h2>
            <p className="text-4xl font-bold text-primary">12</p>
            <p className="text-sm text-muted-foreground mt-2">Published blog posts</p>
          </Card>
          
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-2">Categories</h2>
            <p className="text-4xl font-bold text-primary">8</p>
            <p className="text-sm text-muted-foreground mt-2">Product categories</p>
          </Card>
        </div>
      )}
      
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="btn-primary p-2 rounded">Add New Product</button>
          <button className="btn-primary p-2 rounded">View Orders</button>
          <button className="btn-primary p-2 rounded">Manage Users</button>
          <button className="btn-primary p-2 rounded">Create Blog Post</button>
        </div>
      </div>
      
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">System Status</h2>
        <div className="bg-green-100 text-green-800 p-4 rounded">
          <p className="font-medium">All systems operational</p>
          <p className="text-sm mt-1">Database and API are functioning normally</p>
        </div>
      </div>
    </div>
  );
}
