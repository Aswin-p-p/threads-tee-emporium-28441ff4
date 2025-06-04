
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Filter, Search } from 'lucide-react';
import Header from '../components/Header';
import ProductCard from '../components/ProductCard';
import { productsAPI } from '../services/api';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter states
  const [keyword, setKeyword] = useState(searchParams.get('keyword') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || '');
  const [priceRange, setPriceRange] = useState([
    parseInt(searchParams.get('minPrice') || '0'),
    parseInt(searchParams.get('maxPrice') || '5000')
  ]);
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page') || '1'));
  
  // Pagination state
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    count: 0,
    total: 0,
  });

  const categories = ['Men', 'Women', 'Kids', 'Sports', 'Casual', 'Formal'];
  const sortOptions = [
    { value: 'default', label: 'Default' },
    { value: 'price', label: 'Price: Low to High' },
    { value: '-price', label: 'Price: High to Low' },
    { value: '-rating', label: 'Rating: High to Low' },
    { value: '-createdAt', label: 'Newest First' },
  ];

  useEffect(() => {
    fetchProducts();
  }, [searchParams]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const queryString = buildQueryString();
      const response = await productsAPI.getProducts(queryString);
      setProducts(response.data || []);
      setPagination(response.pagination || {});
    } catch (error) {
      console.error('Error fetching products:', error);
      // Set some mock data for now since API is not available
      setProducts([
        {
          _id: '1',
          name: 'Classic T-Shirt',
          price: 599,
          images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400'],
          rating: 4.5,
          category: 'Men'
        },
        {
          _id: '2',
          name: 'Premium Polo',
          price: 899,
          images: ['https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=400'],
          rating: 4.8,
          category: 'Men'
        }
      ]);
      setPagination({ page: 1, pages: 1, count: 2, total: 2 });
    } finally {
      setLoading(false);
    }
  };

  const buildQueryString = () => {
    const params = new URLSearchParams();
    
    if (keyword) params.append('keyword', keyword);
    if (category) params.append('category', category);
    if (sortBy && sortBy !== 'default') params.append('sort', sortBy);
    if (priceRange[0] > 0) params.append('minPrice', priceRange[0].toString());
    if (priceRange[1] < 5000) params.append('maxPrice', priceRange[1].toString());
    params.append('page', currentPage.toString());
    params.append('limit', '12');
    
    return params.toString() ? `?${params.toString()}` : '';
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters();
  };

  const updateFilters = () => {
    const params = new URLSearchParams();
    
    if (keyword) params.set('keyword', keyword);
    if (category) params.set('category', category);
    if (sortBy && sortBy !== 'default') params.set('sort', sortBy);
    if (priceRange[0] > 0) params.set('minPrice', priceRange[0].toString());
    if (priceRange[1] < 5000) params.set('maxPrice', priceRange[1].toString());
    params.set('page', '1');
    
    setSearchParams(params);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setKeyword('');
    setCategory('');
    setSortBy('default');
    setPriceRange([0, 5000]);
    setCurrentPage(1);
    setSearchParams({});
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', page.toString());
    setSearchParams(params);
    setCurrentPage(page);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Products</h1>
            <p className="text-gray-600">
              {pagination.total > 0 ? `Showing ${pagination.count} of ${pagination.total} products` : 'No products found'}
            </p>
          </div>
          
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="md:hidden mt-4"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className={`lg:block ${showFilters ? 'block' : 'hidden'}`}>
            <Card className="sticky top-4">
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-semibold">Filters</h2>
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    Clear All
                  </Button>
                </div>

                <div className="space-y-6">
                  {/* Search */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Search</label>
                    <form onSubmit={handleSearch} className="flex gap-2">
                      <Input
                        placeholder="Search products..."
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                      />
                      <Button type="submit" size="sm">
                        <Search className="h-4 w-4" />
                      </Button>
                    </form>
                  </div>

                  {/* Category */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Category</label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Categories" />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Price Range */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Price Range: ₹{priceRange[0]} - ₹{priceRange[1]}
                    </label>
                    <Slider
                      value={priceRange}
                      onValueChange={setPriceRange}
                      max={5000}
                      min={0}
                      step={100}
                      className="mt-2"
                    />
                  </div>

                  {/* Sort */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Sort By</label>
                    <Select value={sortBy || 'default'} onValueChange={setSortBy}>
                      <SelectTrigger>
                        <SelectValue placeholder="Default" />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        {sortOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button onClick={updateFilters} className="w-full">
                    Apply Filters
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(9)].map((_, index) => (
                  <Card key={index} className="animate-pulse">
                    <div className="h-64 bg-gray-200"></div>
                    <CardContent className="p-4">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded mb-2 w-3/4"></div>
                      <div className="h-6 bg-gray-200 rounded"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : products.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                {pagination.pages > 1 && (
                  <div className="flex justify-center items-center space-x-2 mt-12">
                    <Button
                      variant="outline"
                      disabled={currentPage === 1}
                      onClick={() => handlePageChange(currentPage - 1)}
                    >
                      Previous
                    </Button>
                    
                    {[...Array(pagination.pages)].map((_, index) => (
                      <Button
                        key={index + 1}
                        variant={currentPage === index + 1 ? "default" : "outline"}
                        onClick={() => handlePageChange(index + 1)}
                      >
                        {index + 1}
                      </Button>
                    ))}
                    
                    <Button
                      variant="outline"
                      disabled={currentPage === pagination.pages}
                      onClick={() => handlePageChange(currentPage + 1)}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <Card className="text-center py-12">
                <CardContent>
                  <p className="text-xl text-gray-600 mb-4">No products found</p>
                  <p className="text-gray-500 mb-6">Try adjusting your filters or search terms</p>
                  <Button onClick={clearFilters}>Clear Filters</Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;
