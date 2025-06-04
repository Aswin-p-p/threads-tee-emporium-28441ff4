
// Mock data for when the API is not available
export const mockProducts = [
  {
    _id: '1',
    name: 'Classic Cotton T-Shirt',
    price: 599,
    images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400'],
    rating: 4.5,
    category: 'Men',
    description: 'Comfortable cotton t-shirt perfect for everyday wear',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['White', 'Black', 'Navy'],
    stock: 50
  },
  {
    _id: '2',
    name: 'Premium Polo Shirt',
    price: 899,
    images: ['https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=400'],
    rating: 4.8,
    category: 'Men',
    description: 'High-quality polo shirt for a smart casual look',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['White', 'Navy', 'Gray'],
    stock: 30
  },
  {
    _id: '3',
    name: 'Women\'s Casual Tee',
    price: 549,
    images: ['https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400'],
    rating: 4.6,
    category: 'Women',
    description: 'Soft and comfortable women\'s t-shirt',
    sizes: ['XS', 'S', 'M', 'L'],
    colors: ['Pink', 'White', 'Lavender'],
    stock: 40
  },
  {
    _id: '4',
    name: 'Sports Performance Tee',
    price: 799,
    images: ['https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400'],
    rating: 4.7,
    category: 'Sports',
    description: 'Moisture-wicking performance t-shirt for active lifestyle',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Black', 'Gray', 'Blue'],
    stock: 25
  },
  {
    _id: '5',
    name: 'Kids Fun T-Shirt',
    price: 399,
    images: ['https://images.unsplash.com/photo-1503919005314-30d93d07d823?w=400'],
    rating: 4.4,
    category: 'Kids',
    description: 'Colorful and fun t-shirt for kids',
    sizes: ['XS', 'S', 'M'],
    colors: ['Red', 'Blue', 'Green'],
    stock: 35
  },
  {
    _id: '6',
    name: 'Formal Business Shirt',
    price: 1299,
    images: ['https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?w=400'],
    rating: 4.9,
    category: 'Formal',
    description: 'Professional dress shirt for business occasions',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['White', 'Light Blue', 'Gray'],
    stock: 20
  }
];

export const mockCartItems = [];

// Mock users - including admin user
export const mockUsers = [
  {
    _id: 'user1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'user'
  },
  {
    _id: 'admin1',
    name: 'Admin User',
    email: 'admin@example.com', 
    role: 'admin'
  }
];

export const mockUser = {
  _id: 'user1',
  name: 'John Doe',
  email: 'john@example.com',
  role: 'user'
};

export const mockAdminUser = {
  _id: 'admin1',
  name: 'Admin User',
  email: 'admin@example.com',
  role: 'admin'
};
