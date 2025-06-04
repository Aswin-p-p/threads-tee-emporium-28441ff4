
import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  Users, 
  Package, 
  ShoppingCart, 
  DollarSign,
  Plus,
  Settings,
  LogOut
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { adminAPI, productsAPI, ordersAPI } from '../services/api';

const AdminDashboard = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
      return;
    }
    fetchDashboardData();
  }, [isAdmin, navigate]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsResponse, ordersResponse] = await Promise.all([
        adminAPI.getStats(),
        ordersAPI.getAllOrders('?limit=5&sort=-createdAt')
      ]);
      
      setStats(statsResponse.data || {});
      setRecentOrders(ordersResponse.data || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto text-center">
          <CardContent className="pt-6">
            <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
            <p className="text-gray-600 mb-6">You don't have permission to access this page</p>
            <Button onClick={() => navigate('/')}>Go to Home</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-lg min-h-screen">
          <div className="p-6">
            <div className="flex items-center space-x-2 mb-8">
              <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">V</span>
              </div>
              <span className="text-xl font-bold gradient-text">Vexa Admin</span>
            </div>
            
            <nav className="space-y-2">
              <Link 
                to="/admin" 
                className="flex items-center space-x-2 p-3 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <BarChart3 className="h-5 w-5" />
                <span>Dashboard</span>
              </Link>
              
              <Link 
                to="/admin/products" 
                className="flex items-center space-x-2 p-3 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Package className="h-5 w-5" />
                <span>Products</span>
              </Link>
              
              <Link 
                to="/admin/orders" 
                className="flex items-center space-x-2 p-3 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <ShoppingCart className="h-5 w-5" />
                <span>Orders</span>
              </Link>
              
              <Link 
                to="/admin/users" 
                className="flex items-center space-x-2 p-3 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Users className="h-5 w-5" />
                <span>Users</span>
              </Link>
            </nav>
          </div>
          
          <div className="absolute bottom-4 left-4 right-4">
            <div className="border-t pt-4">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium">{user?.name?.charAt(0)}</span>
                </div>
                <div>
                  <p className="text-sm font-medium">{user?.name}</p>
                  <p className="text-xs text-gray-500">Admin</p>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleLogout}
                className="w-full"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          <Routes>
            <Route path="/" element={<DashboardOverview stats={stats} recentOrders={recentOrders} loading={loading} />} />
            <Route path="/products" element={<ProductsManagement />} />
            <Route path="/orders" element={<OrdersManagement />} />
            <Route path="/users" element={<UsersManagement />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

const DashboardOverview = ({ stats, recentOrders, loading }) => {
  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-48 mb-8"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="h-32 bg-gray-200 rounded"></div>
          ))}
        </div>
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Revenue',
      value: `₹${stats.totalRevenue?.toLocaleString() || 0}`,
      icon: DollarSign,
      color: 'text-green-600',
      bg: 'bg-green-100'
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders || 0,
      icon: ShoppingCart,
      color: 'text-blue-600',
      bg: 'bg-blue-100'
    },
    {
      title: 'Total Products',
      value: stats.totalProducts || 0,
      icon: Package,
      color: 'text-purple-600',
      bg: 'bg-purple-100'
    },
    {
      title: 'Total Users',
      value: stats.totalUsers || 0,
      icon: Users,
      color: 'text-orange-600',
      bg: 'bg-orange-100'
    }
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Dashboard Overview</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.bg}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {recentOrders.length > 0 ? (
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div key={order._id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">#{order._id.slice(-8)}</p>
                    <p className="text-sm text-gray-600">{order.user?.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">₹{order.totalPrice}</p>
                    <Badge variant={order.orderStatus === 'delivered' ? 'default' : 'secondary'}>
                      {order.orderStatus}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No recent orders</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const ProductsManagement = () => {
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Products Management</h1>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </div>
      <Card>
        <CardContent className="p-6">
          <p className="text-gray-500">Products management features will be implemented here.</p>
        </CardContent>
      </Card>
    </div>
  );
};

const OrdersManagement = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Orders Management</h1>
      <Card>
        <CardContent className="p-6">
          <p className="text-gray-500">Orders management features will be implemented here.</p>
        </CardContent>
      </Card>
    </div>
  );
};

const UsersManagement = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Users Management</h1>
      <Card>
        <CardContent className="p-6">
          <p className="text-gray-500">Users management features will be implemented here.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
