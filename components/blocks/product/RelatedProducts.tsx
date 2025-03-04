'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Product } from '../../../types/product';
import { getRelatedProducts } from '../../../lib/db';
import { Card, CardContent, CardFooter } from '../../ui/card';
import { Button } from '../../ui/button';
import { LazyImage } from '../../ui/LazyImage';

interface RelatedProductsProps {
  product: Product;
}

/**
 * Related products component that displays products from the same category
 */
export const RelatedProducts = ({ product }: RelatedProductsProps) => {
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Use hardcoded translations
  const translations = {
    relatedProducts: "You May Also Like",
    viewDetails: "View Details"
  };

  // Format price with currency
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
    }).format(price);
  };

  // Fetch related products
  useEffect(() => {
    const fetchRelatedProducts = async () => {
      if (!product.id || !product.category_id) return;
      
      try {
        setLoading(true);
        const { data, error } = await getRelatedProducts(
          product.id, 
          product.category_id,
          4 // limit
        );
        
        if (error) throw error;
        
        setRelatedProducts(data as Product[]);
      } catch (err) {
        console.error('Error fetching related products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRelatedProducts();
  }, [product.id, product.category_id]);

  if (loading) {
    return (
      <div className="mt-12">
        <h2 className="text-2xl font-heading font-bold mb-6">{translations.relatedProducts}</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse bg-gray-200 h-64 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (relatedProducts.length === 0) {
    return null;
  }

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-heading font-bold mb-6">{translations.relatedProducts}</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {relatedProducts.map((relatedProduct) => (
          <Card key={relatedProduct.id} className="overflow-hidden">
            <div className="relative h-48 w-full">
              <LazyImage
                src={relatedProduct.image_url}
                alt={relatedProduct.name}
                fill
                sizes="(max-width: 768px) 100vw, 25vw"
                className="object-cover"
                useBlur={true}
                threshold={0.1}
                rootMargin="100px"
              />
            </div>
            
            <CardContent className="p-4">
              <h3 className="font-heading font-bold text-lg mb-2 line-clamp-1">
                {relatedProduct.name}
              </h3>
              
              <div className="flex items-center mb-2">
                {relatedProduct.sale_price ? (
                  <>
                    <span className="font-bold text-primary mr-2">
                      {formatPrice(relatedProduct.sale_price)}
                    </span>
                    <span className="text-sm text-gray-400 line-through">
                      {formatPrice(relatedProduct.price)}
                    </span>
                  </>
                ) : (
                  <span className="font-bold text-primary">
                    {formatPrice(relatedProduct.price)}
                  </span>
                )}
              </div>
              
              <p className="text-gray-600 text-sm line-clamp-2">
                {relatedProduct.description}
              </p>
            </CardContent>
            
            <CardFooter className="p-4 pt-0">
              <Link 
                href={`/products/${relatedProduct.slug}`}
                className="w-full"
              >
                <Button variant="outline" className="w-full">
                  {translations.viewDetails}
                </Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};
