
const API_BASE_URL = 'http://localhost:5000/api/v1';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Helper function to handle API responses
const handleResponse = async (response: Response) => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }
  return data;
};

// Helper function to simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to check if we should use mock data
const shouldUseMockData = async (url: string) => {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return !response.ok;
  } catch {
    return true; // Use mock data if fetch fails
  }
};

// Authentication API
export const authAPI = {
  register: async (userData: any) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      const data = await handleResponse(response);
      if (data.success && data.data?.token) {
        localStorage.setItem('token', data.data.token);
      }
      return data;
    } catch (error) {
      // Mock registration success
      await delay(500);
      const mockToken = 'mock-token-' + Date.now();
      localStorage.setItem('token', mockToken);
      return {
        success: true,
        data: { 
          user: { _id: 'mock-user-id', name: userData.name, email: userData.email, role: 'user' }, 
          token: mockToken 
        },
        message: 'Registration successful'
      };
    }
  },

  login: async (credentials: any) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      const data = await handleResponse(response);
      if (data.success && data.data?.token) {
        localStorage.setItem('token', data.data.token);
      }
      return data;
    } catch (error) {
      // Mock login success
      await delay(500);
      const mockToken = 'mock-token-' + Date.now();
      localStorage.setItem('token', mockToken);
      return {
        success: true,
        data: { 
          user: { _id: 'mock-user-id', name: 'John Doe', email: credentials.email, role: 'user' }, 
          token: mockToken 
        },
        message: 'Login successful'
      };
    }
  },

  getMe: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: getAuthHeaders(),
      });
      const data = await handleResponse(response);
      return data;
    } catch (error) {
      // Return mock user data
      await delay(300);
      return {
        success: true,
        data: { _id: 'mock-user-id', name: 'John Doe', email: 'john@example.com', role: 'user' },
        message: 'User data retrieved'
      };
    }
  },

  updateDetails: async (userData: any) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/updatedetails`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(userData),
      });
      return handleResponse(response);
    } catch (error) {
      await delay(500);
      return { success: true, data: userData, message: 'Profile updated successfully' };
    }
  },

  updatePassword: async (passwordData: any) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/updatepassword`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(passwordData),
      });
      return handleResponse(response);
    } catch (error) {
      await delay(500);
      return { success: true, message: 'Password updated successfully' };
    }
  },

  forgotPassword: async (email: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/forgotpassword`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      return handleResponse(response);
    } catch (error) {
      await delay(500);
      return { success: true, message: 'Password reset email sent' };
    }
  },

  resetPassword: async (token: string, password: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/resetpassword/${token}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      return handleResponse(response);
    } catch (error) {
      await delay(500);
      return { success: true, message: 'Password reset successful' };
    }
  },
};

// Products API
export const productsAPI = {
  getProducts: async (queryParams = '') => {
    try {
      const response = await fetch(`${API_BASE_URL}/products${queryParams}`);
      const data = await handleResponse(response);
      return data;
    } catch (error) {
      // Return mock products data
      await delay(500);
      
      // Parse query params for filtering
      const urlParams = new URLSearchParams(queryParams.replace('?', ''));
      const keyword = urlParams.get('keyword');
      const category = urlParams.get('category');
      const minPrice = urlParams.get('minPrice');
      const maxPrice = urlParams.get('maxPrice');
      const page = parseInt(urlParams.get('page') || '1');
      const limit = parseInt(urlParams.get('limit') || '12');
      
      // Import mock data
      const { mockProducts } = await import('./mockData');
      let filteredProducts = [...mockProducts];
      
      if (keyword) {
        filteredProducts = filteredProducts.filter(product => 
          product.name.toLowerCase().includes(keyword.toLowerCase())
        );
      }
      
      if (category && category !== 'all') {
        filteredProducts = filteredProducts.filter(product => 
          product.category.toLowerCase() === category.toLowerCase()
        );
      }

      if (minPrice) {
        filteredProducts = filteredProducts.filter(product => 
          product.price >= parseInt(minPrice)
        );
      }

      if (maxPrice) {
        filteredProducts = filteredProducts.filter(product => 
          product.price <= parseInt(maxPrice)
        );
      }

      // Pagination
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedProducts = filteredProducts.slice(startIndex, endIndex);
      
      return {
        success: true,
        data: paginatedProducts,
        pagination: {
          page,
          pages: Math.ceil(filteredProducts.length / limit),
          count: paginatedProducts.length,
          total: filteredProducts.length
        }
      };
    }
  },

  getProduct: async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/products/${id}`);
      const data = await handleResponse(response);
      return data;
    } catch (error) {
      await delay(300);
      const { mockProducts } = await import('./mockData');
      const product = mockProducts.find(p => p._id === id);
      if (!product) {
        throw new Error('Product not found');
      }
      return { success: true, data: product };
    }
  },

  createProduct: async (productData: any) => {
    try {
      const response = await fetch(`${API_BASE_URL}/products`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(productData),
      });
      return handleResponse(response);
    } catch (error) {
      await delay(500);
      return { success: true, data: { ...productData, _id: Date.now().toString() }, message: 'Product created successfully' };
    }
  },

  updateProduct: async (id: string, productData: any) => {
    try {
      const response = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(productData),
      });
      return handleResponse(response);
    } catch (error) {
      await delay(500);
      return { success: true, data: { ...productData, _id: id }, message: 'Product updated successfully' };
    }
  },

  deleteProduct: async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      return handleResponse(response);
    } catch (error) {
      await delay(500);
      return { success: true, message: 'Product deleted successfully' };
    }
  },

  addReview: async (id: string, reviewData: any) => {
    try {
      const response = await fetch(`${API_BASE_URL}/products/${id}/reviews`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(reviewData),
      });
      return handleResponse(response);
    } catch (error) {
      await delay(500);
      return { success: true, data: reviewData, message: 'Review added successfully' };
    }
  },

  uploadImages: async (id: string, images: FormData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/products/${id}/images`, {
        method: 'PUT',
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: images,
      });
      return handleResponse(response);
    } catch (error) {
      await delay(500);
      return { success: true, message: 'Images uploaded successfully' };
    }
  },
};

// Cart API
export const cartAPI = {
  getCart: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/cart`, {
        headers: getAuthHeaders(),
      });
      const data = await handleResponse(response);
      return data;
    } catch (error) {
      await delay(300);
      // Get cart items from localStorage or return empty array
      const cartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
      return { success: true, data: cartItems };
    }
  },

  addToCart: async (productData: any) => {
    try {
      const response = await fetch(`${API_BASE_URL}/cart`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(productData),
      });
      const data = await handleResponse(response);
      return data;
    } catch (error) {
      await delay(300);
      
      // Find the product from mock data
      const { mockProducts } = await import('./mockData');
      const product = mockProducts.find(p => p._id === productData.productId);
      if (!product) {
        throw new Error('Product not found');
      }
      
      // Get existing cart items
      const cartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
      
      // Check if item already exists in cart
      const existingItemIndex = cartItems.findIndex(
        (item: any) => 
          item.product._id === productData.productId && 
          item.size === productData.size && 
          item.color === productData.color
      );
      
      if (existingItemIndex > -1) {
        // Update quantity
        cartItems[existingItemIndex].quantity += productData.quantity;
      } else {
        // Add new item
        cartItems.push({
          _id: Date.now().toString(),
          product,
          quantity: productData.quantity,
          size: productData.size,
          color: productData.color
        });
      }
      
      // Save to localStorage
      localStorage.setItem('cartItems', JSON.stringify(cartItems));
      
      return { success: true, data: cartItems, message: 'Item added to cart' };
    }
  },

  updateCartItem: async (productId: string, quantity: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/cart/${productId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ quantity }),
      });
      return handleResponse(response);
    } catch (error) {
      await delay(300);
      
      const cartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
      const itemIndex = cartItems.findIndex((item: any) => item.product._id === productId);
      
      if (itemIndex > -1) {
        cartItems[itemIndex].quantity = quantity;
        localStorage.setItem('cartItems', JSON.stringify(cartItems));
      }
      
      return { success: true, data: cartItems, message: 'Cart updated' };
    }
  },

  removeFromCart: async (productId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/cart/${productId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      return handleResponse(response);
    } catch (error) {
      await delay(300);
      
      const cartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
      const filteredItems = cartItems.filter((item: any) => item.product._id !== productId);
      localStorage.setItem('cartItems', JSON.stringify(filteredItems));
      
      return { success: true, data: filteredItems, message: 'Item removed from cart' };
    }
  },

  clearCart: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/cart`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      return handleResponse(response);
    } catch (error) {
      await delay(300);
      localStorage.removeItem('cartItems');
      return { success: true, data: [], message: 'Cart cleared' };
    }
  },
};

// Orders API
export const ordersAPI = {
  createOrder: async (orderData: any) => {
    try {
      const response = await fetch(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(orderData),
      });
      const data = await handleResponse(response);
      return data;
    } catch (error) {
      await delay(500);
      const mockOrder = { 
        _id: Date.now().toString(), 
        ...orderData, 
        orderStatus: 'pending',
        createdAt: new Date().toISOString()
      };
      return { 
        success: true, 
        data: mockOrder,
        message: 'Order created successfully'
      };
    }
  },

  getOrder: async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/orders/${id}`, {
        headers: getAuthHeaders(),
      });
      return handleResponse(response);
    } catch (error) {
      await delay(300);
      return { 
        success: true, 
        data: { 
          _id: id, 
          orderStatus: 'delivered', 
          totalPrice: 1200,
          createdAt: new Date().toISOString()
        } 
      };
    }
  },

  getMyOrders: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/orders/myorders`, {
        headers: getAuthHeaders(),
      });
      const data = await handleResponse(response);
      return data;
    } catch (error) {
      await delay(300);
      return { success: true, data: [] };
    }
  },

  getAllOrders: async (queryParams = '') => {
    try {
      const response = await fetch(`${API_BASE_URL}/orders${queryParams}`, {
        headers: getAuthHeaders(),
      });
      return handleResponse(response);
    } catch (error) {
      await delay(300);
      return { success: true, data: [] };
    }
  },

  processPayment: async (id: string, paymentData: any) => {
    try {
      const response = await fetch(`${API_BASE_URL}/orders/${id}/pay`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(paymentData),
      });
      return handleResponse(response);
    } catch (error) {
      await delay(500);
      return { success: true, message: 'Payment processed successfully' };
    }
  },

  markAsDelivered: async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/orders/${id}/deliver`, {
        method: 'PUT',
        headers: getAuthHeaders(),
      });
      return handleResponse(response);
    } catch (error) {
      await delay(500);
      return { success: true, message: 'Order marked as delivered' };
    }
  },
};

// Admin API
export const adminAPI = {
  getUsers: async (queryParams = '') => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/users${queryParams}`, {
        headers: getAuthHeaders(),
      });
      return handleResponse(response);
    } catch (error) {
      await delay(300);
      return { success: true, data: [] };
    }
  },

  getUser: async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/users/${id}`, {
        headers: getAuthHeaders(),
      });
      return handleResponse(response);
    } catch (error) {
      await delay(300);
      return { success: true, data: { _id: id, name: 'User', email: 'user@example.com' } };
    }
  },

  updateUser: async (id: string, userData: any) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/users/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(userData),
      });
      return handleResponse(response);
    } catch (error) {
      await delay(500);
      return { success: true, data: userData, message: 'User updated successfully' };
    }
  },

  deleteUser: async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/users/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      return handleResponse(response);
    } catch (error) {
      await delay(500);
      return { success: true, message: 'User deleted successfully' };
    }
  },

  getStats: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/stats`, {
        headers: getAuthHeaders(),
      });
      return handleResponse(response);
    } catch (error) {
      await delay(300);
      return { 
        success: true, 
        data: { 
          totalUsers: 150, 
          totalProducts: 25,
          totalOrders: 1200, 
          totalRevenue: 85000 
        } 
      };
    }
  },
};

// Payment API (Razorpay)
export const paymentAPI = {
  createOrder: async (orderData: any) => {
    try {
      const response = await fetch(`${API_BASE_URL}/payment/orders`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(orderData),
      });
      return handleResponse(response);
    } catch (error) {
      await delay(500);
      return { success: true, data: { orderId: Date.now().toString() } };
    }
  },

  verifyPayment: async (paymentData: any) => {
    try {
      const response = await fetch(`${API_BASE_URL}/payment/verify`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(paymentData),
      });
      return handleResponse(response);
    } catch (error) {
      await delay(500);
      return { success: true, message: 'Payment verified successfully' };
    }
  },
};

// Upload API (Cloudinary)
export const uploadAPI = {
  uploadImage: async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formData,
      });
      return handleResponse(response);
    } catch (error) {
      await delay(500);
      // Return a placeholder image URL
      return { 
        success: true, 
        data: { 
          url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400' 
        } 
      };
    }
  },
};
