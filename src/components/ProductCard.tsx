
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, ShoppingCart } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

interface Product {
  _id: string;
  name: string;
  description?: string;
  price: number;
  images: string[];
  category: string;
  sizes?: string[];
  colors?: string[];
  rating?: number;
  numReviews?: number;
  inStock?: boolean;
  stock?: number;
}

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    // Add with default size and color
    const defaultSize = product.sizes?.[0] || 'M';
    const defaultColor = product.colors?.[0] || 'Black';
    addToCart(product._id, 1, defaultSize, defaultColor);
  };

  const handleBuyNow = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    // Add to cart and redirect to checkout
    const defaultSize = product.sizes?.[0] || 'M';
    const defaultColor = product.colors?.[0] || 'Black';
    addToCart(product._id, 1, defaultSize, defaultColor);
    navigate('/checkout');
  };

  const isOutOfStock = product.stock === 0 || product.inStock === false;

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 overflow-hidden">
      <div className="relative overflow-hidden">
        <Link to={`/products/${product._id}`}>
          <img
            src={product.images[0] || 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400'}
            alt={product.name}
            className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-300"
          />
        </Link>
        {isOutOfStock && (
          <Badge variant="destructive" className="absolute top-2 left-2">
            Out of Stock
          </Badge>
        )}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            size="sm"
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className="rounded-full w-10 h-10 p-0"
          >
            <ShoppingCart className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <Badge variant="secondary" className="text-xs">
            {product.category}
          </Badge>
          {product.rating && (
            <div className="flex items-center space-x-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm text-gray-600">
                {product.rating.toFixed(1)} {product.numReviews && `(${product.numReviews})`}
              </span>
            </div>
          )}
        </div>
        
        <Link to={`/products/${product._id}`}>
          <h3 className="font-semibold text-lg mb-2 hover:text-primary-600 transition-colors line-clamp-2">
            {product.name}
          </h3>
        </Link>
        
        {product.description && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {product.description}
          </p>
        )}
        
        <div className="flex items-center justify-between mb-3">
          <div className="text-2xl font-bold text-primary-600">
            ₹{product.price}
          </div>
          {product.sizes && product.sizes.length > 0 && (
            <div className="flex space-x-1">
              {product.sizes.slice(0, 3).map((size) => (
                <Badge key={size} variant="outline" className="text-xs">
                  {size}
                </Badge>
              ))}
              {product.sizes.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{product.sizes.length - 3}
                </Badge>
              )}
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <Button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            variant="outline"
            size="sm"
          >
            {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
          </Button>
          <Button
            onClick={handleBuyNow}
            disabled={isOutOfStock}
            size="sm"
          >
            Buy Now
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
