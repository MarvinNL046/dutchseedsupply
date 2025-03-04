'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Layout } from '../../components/layout/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { getCurrentUser } from '../../lib/auth';
import { getUserProfile, getUserOrders, getLoyaltyPoints } from '../../lib/db';
import { User, Package, Gift } from 'lucide-react';

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loyaltyPoints, setLoyaltyPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loyaltyError, setLoyaltyError] = useState<string | null>(null);
  const [signingOut, setSigningOut] = useState(false);
  
  // Check if user is logged in
  useEffect(() => {
    async function checkAuth() {
      setLoading(true);
      setLoyaltyError(null);
      
      try {
        const { user } = await getCurrentUser();
        
        if (!user) {
          // User is not logged in, redirect to login page
          router.push('/login?redirect=/account');
          return;
        }
        
        setUser(user);
        
        // Fetch user profile and orders
        const [profileResult, ordersResult] = await Promise.all([
          getUserProfile(user.id),
          getUserOrders(user.id),
        ]);
        
        setProfile(profileResult.data);
        setOrders(ordersResult.data || []);
        
        // Fetch loyalty points separately with error handling
        try {
          const pointsResult = await getLoyaltyPoints(user.id);
          if (pointsResult.error) {
            console.error('Error fetching loyalty points:', pointsResult.error);
            setLoyaltyError('Could not fetch loyalty points');
            setLoyaltyPoints(0);
          } else {
            setLoyaltyPoints(pointsResult.data || 0);
          }
        } catch (error) {
          console.error('Exception fetching loyalty points:', error);
          setLoyaltyError('Could not fetch loyalty points');
          setLoyaltyPoints(0);
        }
      } catch (error) {
        console.error('Error in checkAuth:', error);
      } finally {
        setLoading(false);
      }
    }
    
    checkAuth();
  }, [router]);
  
  // Handle logout - improved with direct API call and error handling
  const handleLogout = async () => {
    try {
      setSigningOut(true);
      
      // Use direct fetch to the signout API endpoint
      const response = await fetch('/api/auth/signout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const result = await response.json();
        console.error('Sign out error:', result.error);
        alert('Failed to sign out. Please try again.');
        setSigningOut(false);
        return;
      }
      
      console.log('Sign out successful');
      
      // Redirect to home page after signing out
      window.location.href = '/';
    } catch (error) {
      console.error('Unexpected error during sign out:', error);
      alert('An unexpected error occurred during sign out. Please try again.');
      setSigningOut(false);
    }
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  };
  
  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">My Account</h1>
          <Button 
            variant="outline" 
            onClick={handleLogout} 
            disabled={signingOut}
          >
            {signingOut ? 'Signing Out...' : 'Sign Out'}
          </Button>
        </div>
        
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>Profile</span>
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              <span>Orders</span>
            </TabsTrigger>
            <TabsTrigger value="loyalty" className="flex items-center gap-2">
              <Gift className="w-4 h-4" />
              <span>Loyalty Points</span>
            </TabsTrigger>
          </TabsList>
          
          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  View and update your account details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium">Email</h3>
                    <p className="text-gray-600">{user?.email}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium">Full Name</h3>
                    <p className="text-gray-600">{profile?.full_name || "Not provided"}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium">Address</h3>
                    <p className="text-gray-600">{profile?.address || "Not provided"}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium">Phone</h3>
                    <p className="text-gray-600">{profile?.phone || "Not provided"}</p>
                  </div>
                  
                  <div className="pt-4">
                    <Button onClick={() => router.push('/account/edit-profile')}>
                      Edit Profile
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Orders Tab */}
          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Order History</CardTitle>
                <CardDescription>
                  View your past orders and their status
                </CardDescription>
              </CardHeader>
              <CardContent>
                {orders.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600">You have not placed any orders yet.</p>
                    <Button className="mt-4" onClick={() => router.push('/products')}>
                      Browse Products
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {orders.map((order) => (
                      <div key={order.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="font-medium">Order #{order.id.substring(0, 8)}</h3>
                            <p className="text-sm text-gray-500">
                              Placed on {formatDate(order.created_at)}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                              order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                              order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                              order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                              order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </span>
                            <p className="font-medium mt-1">
                              {formatPrice(order.total_amount || order.total)}
                            </p>
                          </div>
                        </div>
                        
                        <div className="mt-2">
                          <h4 className="text-sm font-medium mb-1">Items</h4>
                          <ul className="text-sm text-gray-600">
                            {order.order_items?.map((item: any) => (
                              <li key={item.id} className="flex justify-between py-1">
                                <span>
                                  {item.product?.name || "Product"} x{item.quantity}
                                </span>
                                <span>{formatPrice(item.price)}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div className="mt-4 pt-4 border-t">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => router.push(`/account/orders/${order.id}`)}
                          >
                            View Details
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Loyalty Points Tab */}
          <TabsContent value="loyalty">
            <Card>
              <CardHeader>
                <CardTitle>Loyalty Points</CardTitle>
                <CardDescription>
                  Earn points with every purchase and redeem them for discounts
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loyaltyError ? (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <p className="text-red-600">{loyaltyError}</p>
                    <p className="text-sm text-red-500 mt-1">
                      Please try refreshing the page. If the problem persists, contact customer support.
                    </p>
                  </div>
                ) : (
                  <div className="bg-primary/10 rounded-lg p-6 mb-6 text-center">
                    <h3 className="text-lg font-medium mb-2">Current Balance</h3>
                    <p className="text-4xl font-bold text-primary">{loyaltyPoints}</p>
                    <p className="text-sm text-gray-600 mt-2">
                      {loyaltyPoints === 1 ? "1 point" : loyaltyPoints + " points"}
                    </p>
                  </div>
                )}
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2">How to Earn Points</h3>
                    <ul className="list-disc pl-5 space-y-1 text-gray-600">
                      <li>Earn 1 point for every €20 spent</li>
                      <li>Points are awarded after your order is delivered</li>
                      <li>Create an account and stay logged in when shopping</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-2">How to Redeem Points</h3>
                    <ul className="list-disc pl-5 space-y-1 text-gray-600">
                      <li>10 points = €5 discount</li>
                      <li>25 points = €15 discount</li>
                      <li>50 points = €35 discount</li>
                    </ul>
                  </div>
                  
                  {loyaltyPoints >= 10 && (
                    <div className="pt-4">
                      <Button>Redeem Points</Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
