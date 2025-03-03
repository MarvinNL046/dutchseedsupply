'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Layout } from '../../../../components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { getCurrentUser } from '../../../../lib/auth';
import { getOrderById } from '../../../../lib/db';
import { ArrowLeft, Truck, Package, CheckCircle } from 'lucide-react';

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Check if user is logged in and load order data
  useEffect(() => {
    async function loadOrder() {
      setLoading(true);
      const { user } = await getCurrentUser();
      
      if (!user) {
        // User is not logged in, redirect to login page
        router.push(`/login?redirect=/account/orders/${params.id}`);
        return;
      }
      
      // Fetch order details
      const { data, error } = await getOrderById(params.id);
      
      if (error || !data) {
        console.error('Error fetching order:', error);
        router.push('/account?tab=orders');
        return;
      }
      
      // Check if the order belongs to the current user
      if (data.user_id !== user.id) {
        console.error('Order does not belong to current user');
        router.push('/account?tab=orders');
        return;
      }
      
      setOrder(data);
      setLoading(false);
    }
    
    loadOrder();
  }, [router, params.id]);
  
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
  
  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'shipped':
        return <Truck className="w-6 h-6 text-blue-500" />;
      case 'processing':
        return <Package className="w-6 h-6 text-yellow-500" />;
      default:
        return <Package className="w-6 h-6 text-gray-500" />;
    }
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
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center mb-8">
            <Button 
              variant="ghost" 
              onClick={() => router.push('/account?tab=orders')}
              className="mr-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Orders
            </Button>
            <h1 className="text-3xl font-bold">Order Details</h1>
          </div>
          
          {/* Order Summary */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>Order #{order.id.substring(0, 8)}</CardTitle>
                  <CardDescription>
                    Placed on {formatDate(order.created_at)}
                  </CardDescription>
                </div>
                <div className="flex items-center">
                  {getStatusIcon(order.status)}
                  <span className={`ml-2 inline-block px-3 py-1 rounded-full text-sm font-medium ${
                    order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                    order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                    order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                    order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Order Information */}
                <div>
                  <h3 className="text-lg font-medium mb-4">Order Information</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Order Date</p>
                      <p>{formatDate(order.created_at)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Order Status</p>
                      <p>{order.status.charAt(0).toUpperCase() + order.status.slice(1)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Payment Method</p>
                      <p>{order.payment_info?.method || 'Credit Card'}</p>
                    </div>
                    {order.loyalty_points_earned > 0 && (
                      <div>
                        <p className="text-sm text-gray-500">Loyalty Points Earned</p>
                        <p>{order.loyalty_points_earned} points</p>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Shipping Information */}
                <div>
                  <h3 className="text-lg font-medium mb-4">Shipping Information</h3>
                  <div className="space-y-3">
                    {order.shipping_info && (
                      <>
                        <div>
                          <p className="text-sm text-gray-500">Recipient</p>
                          <p>{order.shipping_info.name || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Address</p>
                          <p>
                            {order.shipping_info.address || 'N/A'}
                            {order.shipping_info.city && `, ${order.shipping_info.city}`}
                            {order.shipping_info.postal_code && ` ${order.shipping_info.postal_code}`}
                          </p>
                          <p>
                            {order.shipping_info.country || ''}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Phone</p>
                          <p>{order.shipping_info.phone || 'N/A'}</p>
                        </div>
                      </>
                    )}
                    {order.shipping_method && (
                      <div>
                        <p className="text-sm text-gray-500">Shipping Method</p>
                        <p>{order.shipping_method}</p>
                      </div>
                    )}
                    {order.tracking_number && (
                      <div>
                        <p className="text-sm text-gray-500">Tracking Number</p>
                        <p>{order.tracking_number}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Product</th>
                      <th className="text-center py-3 px-4">Quantity</th>
                      <th className="text-right py-3 px-4">Price</th>
                      <th className="text-right py-3 px-4">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.order_items?.map((item: any) => (
                      <tr key={item.id} className="border-b">
                        <td className="py-4 px-4">
                          <div className="flex items-center">
                            {item.product?.image_url && (
                              <div className="w-12 h-12 mr-4 rounded overflow-hidden">
                                <Image 
                                  src={item.product.image_url} 
                                  alt={item.product?.name || 'Product'} 
                                  width={48}
                                  height={48}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                            <div>
                              <p className="font-medium">{item.product?.name || 'Product'}</p>
                              {item.product?.specifications?.strength && (
                                <p className="text-sm text-gray-500">
                                  Strength: {item.product.specifications.strength}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-center">{item.quantity}</td>
                        <td className="py-4 px-4 text-right">{formatPrice(item.price)}</td>
                        <td className="py-4 px-4 text-right">{formatPrice(item.price * item.quantity)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-b">
                      <td colSpan={3} className="py-4 px-4 text-right font-medium">Subtotal</td>
                      <td className="py-4 px-4 text-right">{formatPrice(order.total_amount || order.total)}</td>
                    </tr>
                    {order.shipping_cost > 0 && (
                      <tr className="border-b">
                        <td colSpan={3} className="py-4 px-4 text-right font-medium">Shipping</td>
                        <td className="py-4 px-4 text-right">{formatPrice(order.shipping_cost)}</td>
                      </tr>
                    )}
                    {order.discount > 0 && (
                      <tr className="border-b">
                        <td colSpan={3} className="py-4 px-4 text-right font-medium">Discount</td>
                        <td className="py-4 px-4 text-right">-{formatPrice(order.discount)}</td>
                      </tr>
                    )}
                    <tr>
                      <td colSpan={3} className="py-4 px-4 text-right font-medium">Total</td>
                      <td className="py-4 px-4 text-right font-bold">{formatPrice(order.total_amount || order.total)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
