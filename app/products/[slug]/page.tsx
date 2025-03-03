import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Layout } from '../../../components/layout/Layout';
import { ProductGallery } from '../../../components/blocks/product/ProductGallery';
import { ProductInfo } from '../../../components/blocks/product/ProductInfo';
import { ProductSpecifications } from '../../../components/blocks/product/ProductSpecifications';
import { RelatedProducts } from '../../../components/blocks/product/RelatedProducts';
import { ProductSchema } from '../../../lib/schema/ProductSchema';
import { getProductBySlug, getProducts, getRelatedProducts } from '../../../lib/db';
import { getServerSideConfig } from '../../../lib/site-config-server';

// Define the revalidate time for ISR
export const revalidate = 3600; // Revalidate every hour

// Generate metadata for the product page
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const { slug } = params;
  const { data: product } = await getProductBySlug(slug);
  const siteConfig = await getServerSideConfig();
  
  if (!product) {
    return {
      title: 'Product Not Found',
      description: 'The requested product could not be found.',
    };
  }
  
  return {
    title: `${product.name} | ${siteConfig.name}`,
    description: product.description.substring(0, 160),
    keywords: `cannabis seeds, ${product.name}, ${product.categories?.name || ''}`,
    openGraph: {
      title: `${product.name} | ${siteConfig.name}`,
      description: product.description.substring(0, 160),
      images: [product.image_url],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.name} | ${siteConfig.name}`,
      description: product.description.substring(0, 160),
      images: [product.image_url],
    },
  };
}

// Generate static params for all products
export async function generateStaticParams() {
  // Get all products (without limit as it's not in ProductFilter)
  const { data: products } = await getProducts();
  
  return products?.map((product) => ({
    slug: product.slug,
  })) || [];
}

// Product detail page component
export default async function ProductPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  
  // Fetch product data
  const { data: product, error } = await getProductBySlug(slug);
  
  // If product not found, return 404
  if (error || !product) {
    notFound();
  }
  
  // Fetch related products
  const { data: relatedProducts = [] } = await getRelatedProducts(
    product.id,
    product.category_id,
    4
  );
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <ProductGallery product={product} />
          
          <ProductInfo product={product} />
        </div>
        
        {product.specifications && (
          <div className="mb-12">
            <ProductSpecifications product={product} />
          </div>
        )}
        
        {relatedProducts && relatedProducts.length > 0 && (
          <div className="mt-16">
            <RelatedProducts product={product} />
          </div>
        )}
        
        {/* Add structured data for SEO */}
        <ProductSchema product={product} />
      </div>
    </Layout>
  );
}
