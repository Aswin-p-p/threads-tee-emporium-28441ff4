
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { CreditCard, MapPin, User } from 'lucide-react';
import Header from '../components/Header';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/use-toast';
import { ordersAPI, paymentAPI } from '../services/api';

const Checkout = () => {
  const navigate = useNavigate();
  const { items, getTotalPrice, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const [shippingAddress, setShippingAddress] = useState({
    fullName: user?.name || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
  });
  
  const [paymentMethod, setPaymentMethod] = useState('card');

  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
    if (items.length === 0) {
      navigate('/cart');
    }
  }, [isAuthenticated, items, navigate]);

  const handleAddressChange = (field: string, value: string) => {
    setShippingAddress(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePlaceOrder = async () => {
    // Validate form
    if (!shippingAddress.fullName || !shippingAddress.phone || !shippingAddress.address) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const shippingCost = getTotalPrice() > 999 ? 0 : 99;
      const taxPrice = Math.round(getTotalPrice() * 0.18);
      const totalPrice = getTotalPrice() + shippingCost + taxPrice;

      // Prepare order data
      const orderData = {
        orderItems: items.map(item => ({
          name: item.product.name,
          qty: item.quantity,
          image: item.product.images[0],
          price: item.product.price,
          product: item.product._id,
          size: item.size,
          color: item.color
        })),
        shippingAddress: {
          address: shippingAddress.address,
          city: shippingAddress.city,
          postalCode: shippingAddress.pincode,
          country: 'India',
          phone: shippingAddress.phone
        },
        paymentMethod,
        itemsPrice: getTotalPrice(),
        taxPrice,
        shippingPrice: shippingCost,
        totalPrice
      };

      // Create order
      const orderResponse = await ordersAPI.createOrder(orderData);
      
      if (orderResponse.success) {
        // Handle payment based on method
        if (paymentMethod === 'card' || paymentMethod === 'upi') {
          try {
            // Create payment order
            const paymentOrderResponse = await paymentAPI.createOrder({
              amount: totalPrice * 100, // Convert to paise for Razorpay
              currency: 'INR',
              orderId: orderResponse.data._id
            });

            if (paymentOrderResponse.success) {
              // In a real app, you would integrate with Razorpay here
              // For now, we'll simulate payment success
              await paymentAPI.verifyPayment({
                orderId: orderResponse.data._id,
                paymentId: 'mock_payment_' + Date.now(),
                signature: 'mock_signature'
              });
            }
          } catch (paymentError) {
            console.log('Payment processing with mock data');
          }
        }

        toast({
          title: "Order Placed Successfully!",
          description: `Order #${orderResponse.data._id.slice(-8)} has been placed.`,
        });
        
        clearCart();
        navigate('/orders');
      } else {
        throw new Error(orderResponse.message || 'Failed to create order');
      }
    } catch (error: any) {
      toast({
        title: "Order Failed",
        description: error.message || "Failed to place order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const shippingCost = getTotalPrice() > 999 ? 0 : 99;
  const taxPrice = Math.round(getTotalPrice() * 0.18);
  const totalAmount = getTotalPrice() + shippingCost + taxPrice;

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Checkout Form */}
          <div className="space-y-6">
            {/* Shipping Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Shipping Address
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Full Name *</label>
                    <Input
                      value={shippingAddress.fullName}
                      onChange={(e) => handleAddressChange('fullName', e.target.value)}
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Phone Number *</label>
                    <Input
                      value={shippingAddress.phone}
                      onChange={(e) => handleAddressChange('phone', e.target.value)}
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Address *</label>
                  <Input
                    value={shippingAddress.address}
                    onChange={(e) => handleAddressChange('address', e.target.value)}
                    placeholder="House no, Building, Street, Area"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">City</label>
                    <Input
                      value={shippingAddress.city}
                      onChange={(e) => handleAddressChange('city', e.target.value)}
                      placeholder="City"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">State</label>
                    <Select value={shippingAddress.state} onValueChange={(value) => handleAddressChange('state', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        <SelectItem value="maharashtra">Maharashtra</SelectItem>
                        <SelectItem value="delhi">Delhi</SelectItem>
                        <SelectItem value="karnataka">Karnataka</SelectItem>
                        <SelectItem value="tamil-nadu">Tamil Nadu</SelectItem>
                        <SelectItem value="gujarat">Gujarat</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Pincode</label>
                    <Input
                      value={shippingAddress.pincode}
                      onChange={(e) => handleAddressChange('pincode', e.target.value)}
                      placeholder="Pincode"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="card">Credit/Debit Card</SelectItem>
                    <SelectItem value="upi">UPI</SelectItem>
                    <SelectItem value="cod">Cash on Delivery</SelectItem>
                  </SelectContent>
                </Select>
                
                {paymentMethod === 'card' && (
                  <div className="mt-4 space-y-4">
                    <Input placeholder="Card Number" />
                    <div className="grid grid-cols-2 gap-4">
                      <Input placeholder="MM/YY" />
                      <Input placeholder="CVV" />
                    </div>
                    <Input placeholder="Cardholder Name" />
                  </div>
                )}
                
                {paymentMethod === 'upi' && (
                  <div className="mt-4">
                    <Input placeholder="UPI ID" />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {items.map((item) => (
                  <div key={`${item.product._id}-${item.size}-${item.color}`} className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium">{item.product.name}</h4>
                      <p className="text-sm text-gray-600">
                        Size: {item.size}, Color: {item.color}
                      </p>
                      <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">₹{item.product.price * item.quantity}</p>
                    </div>
                  </div>
                ))}
                
                <Separator />
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>₹{getTotalPrice()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>{shippingCost === 0 ? 'Free' : `₹${shippingCost}`}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax (18%)</span>
                    <span>₹{taxPrice}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>₹{totalAmount}</span>
                  </div>
                </div>
                
                <Button 
                  onClick={handlePlaceOrder} 
                  className="w-full" 
                  size="lg"
                  disabled={loading}
                >
                  {loading ? 'Placing Order...' : 'Place Order'}
                </Button>
                
                <p className="text-xs text-gray-500 text-center">
                  By placing this order, you agree to our Terms & Conditions
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
