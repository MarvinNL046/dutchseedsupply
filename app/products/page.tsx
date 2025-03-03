'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Layout } from '../../components/layout/Layout';
import { getProducts, getCategories, extractCbdPercentages } from '../../lib/db';
import { Product, Category } from '../../types/product';

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic';

// Loading fallback for Suspense
function ProductsFallback() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">All Cannabis Seeds</h1>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    </Layout>
  );
}

// Wrapper component that uses searchParams
// Main component with Suspense
export default function ProductsPage() {
  return (
    <Suspense fallback={<ProductsFallback />}>
      <ProductsContent />
    </Suspense>
  );
}

function ProductsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [cbdPercentages, setCbdPercentages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [selectedPercentages, setSelectedPercentages] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState({
    min: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : 0,
    max: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : 200,
  });
  const [sortOption, setSortOption] = useState(searchParams.get('sort') || 'newest');
  
  // Fetch initial data
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      
      // Fetch products with filters
      const { data: productsData } = await getProducts({
        search: searchTerm,
        category: selectedCategory,
        minPrice: priceRange.min,
        maxPrice: priceRange.max,
        sort: sortOption as any,
        cbdPercentage: selectedPercentages,
      });
      
      // Fetch categories
      const { data: categoriesData } = await getCategories();
      
      // Fetch CBD percentages
      const { data: percentagesData } = await extractCbdPercentages();
      
      setProducts(productsData || []);
      setCategories(categoriesData || []);
      setCbdPercentages(percentagesData || []);
      setLoading(false);
    }
    
    fetchData();
  }, [searchTerm, selectedCategory, selectedPercentages, priceRange, sortOption]);
  
  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    
    if (searchTerm) params.set('search', searchTerm);
    if (selectedCategory) params.set('category', selectedCategory);
    if (priceRange.min > 0) params.set('minPrice', priceRange.min.toString());
    if (priceRange.max < 200) params.set('maxPrice', priceRange.max.toString());
    if (sortOption !== 'newest') params.set('sort', sortOption);
    
    const url = `/products?${params.toString()}`;
    router.push(url, { scroll: false });
  }, [searchTerm, selectedCategory, priceRange, sortOption, router]);
  
  // Handle filter changes
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category === selectedCategory ? '' : category);
  };
  
  const handlePercentageChange = (percentage: string) => {
    setSelectedPercentages(prev => 
      prev.includes(percentage)
        ? prev.filter(p => p !== percentage)
        : [...prev, percentage]
    );
  };
  
  const handlePriceChange = (min: number, max: number) => {
    setPriceRange({ min, max });
  };
  
  const handleSortChange = (sort: string) => {
    setSortOption(sort);
  };
  
  const handleSearchChange = (search: string) => {
    setSearchTerm(search);
  };
  
  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedPercentages([]);
    setPriceRange({ min: 0, max: 200 });
    setSortOption('newest');
  };
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">All Cannabis Seeds</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-4 mb-4">
              <h2 className="text-xl font-semibold mb-4">Filter</h2>
              
              {/* Search */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Search</label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder="Search seeds..."
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              
              {/* Categories */}
              <div className="mb-6">
                <h3 className="font-medium mb-2">Category</h3>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <div key={category.id} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`category-${category.id}`}
                        checked={selectedCategory === category.slug}
                        onChange={() => handleCategoryChange(category.slug)}
                        className="mr-2"
                      />
                      <label htmlFor={`category-${category.id}`}>{category.name}</label>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Price range */}
              <div className="mb-6">
                <h3 className="font-medium mb-2">Price</h3>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    value={priceRange.min}
                    onChange={(e) => handlePriceChange(Number(e.target.value), priceRange.max)}
                    min="0"
                    max={priceRange.max}
                    className="w-20 px-2 py-1 border rounded-md"
                  />
                  <span>-</span>
                  <input
                    type="number"
                    value={priceRange.max}
                    onChange={(e) => handlePriceChange(priceRange.min, Number(e.target.value))}
                    min={priceRange.min}
                    className="w-20 px-2 py-1 border rounded-md"
                  />
                </div>
              </div>
              
              {/* CBD Percentages */}
              {cbdPercentages.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-medium mb-2">CBD Level</h3>
                  <div className="space-y-2">
                    {cbdPercentages.map((percentage) => (
                      <div key={percentage} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`percentage-${percentage}`}
                          checked={selectedPercentages.includes(percentage)}
                          onChange={() => handlePercentageChange(percentage)}
                          className="mr-2"
                        />
                        <label htmlFor={`percentage-${percentage}`}>{percentage}</label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Clear filters button */}
              <button
                onClick={handleClearFilters}
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-md transition"
              >
                Clear Filters
              </button>
            </div>
          </div>
          
          {/* Products grid */}
          <div className="lg:col-span-3">
            {/* Sort options */}
            <div className="flex justify-between items-center mb-6">
              <p className="text-gray-600">
                {loading ? "Loading..." : `Showing ${products.length} products`}
              </p>
              
              <select
                value={sortOption}
                onChange={(e) => handleSortChange(e.target.value)}
                className="px-3 py-2 border rounded-md"
              >
                <option value="newest">Newest</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>
            
            {/* Products grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-lg shadow animate-pulse">
                    <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                    <div className="p-4">
                      <div className="h-6 bg-gray-200 rounded mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded mb-4"></div>
                      <div className="h-8 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <div key={product.id} className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="relative h-48">
                      <Image
                        src={product.image_url}
                        alt={product.name}
                        width={300}
                        height={192}
                        className="w-full h-full object-cover"
                      />
                      {product.sale_price && (
                        <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-md text-sm">
                          Sale
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-semibold mb-2">{product.name}</h3>
                      <p className="text-gray-600 mb-4 line-clamp-2">{product.description}</p>
                      <div className="flex justify-between items-center">
                        <div>
                          {product.sale_price ? (
                            <div className="flex items-center">
                              <span className="text-lg font-bold text-primary-600">€{product.sale_price.toFixed(2)}</span>
                              <span className="ml-2 text-sm text-gray-500 line-through">€{product.price.toFixed(2)}</span>
                            </div>
                          ) : (
                            <span className="text-lg font-bold text-primary-600">€{product.price.toFixed(2)}</span>
                          )}
                        </div>
                        <button
                          onClick={() => router.push(`/products/${product.slug}`)}
                          className="bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded-md transition"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <h3 className="text-xl font-semibold mb-2">No seeds found</h3>
                <p className="text-gray-600 mb-4">Try adjusting your filters</p>
                <button
                  onClick={handleClearFilters}
                  className="bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded-md transition"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
