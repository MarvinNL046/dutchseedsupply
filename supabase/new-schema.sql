-- New schema for Dutch Seed Supply with improved RLS policies
-- This schema combines all tables from the original schema and migration files
-- with improved RLS policies that use the is_admin function consistently

-- Create is_admin function for checking admin status
CREATE OR REPLACE FUNCTION public.is_admin(uid uuid)
RETURNS boolean AS $$
DECLARE
  is_admin boolean;
BEGIN
  -- Direct query to avoid RLS
  SELECT u.is_admin INTO is_admin
  FROM public.users u
  WHERE u.id = uid;
  
  RETURN COALESCE(is_admin, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  address TEXT,
  phone TEXT,
  loyalty_points INTEGER DEFAULT 0,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Users can view their own profile" 
  ON public.users 
  FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON public.users 
  FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" 
  ON public.users 
  FOR SELECT 
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can update all users" 
  ON public.users 
  FOR UPDATE 
  USING (is_admin(auth.uid()));

-- Categories table
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Create policies for categories table
CREATE POLICY "Categories are viewable by everyone" 
  ON public.categories 
  FOR SELECT 
  USING (true);

CREATE POLICY "Categories are editable by admins only" 
  ON public.categories 
  FOR ALL 
  USING (is_admin(auth.uid()));

-- Products table
CREATE TABLE IF NOT EXISTS public.products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID REFERENCES public.categories(id),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  sale_price DECIMAL(10, 2),
  stock INTEGER NOT NULL DEFAULT 0,
  image_url TEXT NOT NULL,
  additional_images TEXT[],
  specifications JSONB,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Create policies for products table
CREATE POLICY "Products are viewable by everyone" 
  ON public.products 
  FOR SELECT 
  USING (true);

CREATE POLICY "Products are editable by admins only" 
  ON public.products 
  FOR ALL 
  USING (is_admin(auth.uid()));

-- Orders table
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  total DECIMAL(10, 2) NOT NULL,
  shipping_address TEXT NOT NULL,
  shipping_info JSONB,
  payment_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Create policies for orders table
CREATE POLICY "Users can view their own orders" 
  ON public.orders 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own orders" 
  ON public.orders 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all orders" 
  ON public.orders 
  FOR SELECT 
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can update orders" 
  ON public.orders 
  FOR UPDATE 
  USING (is_admin(auth.uid()));

-- Allow guest orders (no user_id required)
CREATE POLICY "Allow guest orders" 
  ON public.orders 
  FOR INSERT 
  WITH CHECK (user_id IS NULL);

-- Order Items table
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) NOT NULL,
  product_id UUID REFERENCES public.products(id) NOT NULL,
  quantity INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Create policies for order_items table
CREATE POLICY "Users can view their own order items" 
  ON public.order_items 
  FOR SELECT 
  USING (auth.uid() IN (SELECT user_id FROM public.orders WHERE id = order_id));

CREATE POLICY "Users can create their own order items" 
  ON public.order_items 
  FOR INSERT 
  WITH CHECK (auth.uid() IN (SELECT user_id FROM public.orders WHERE id = order_id));

CREATE POLICY "Admins can view all order items" 
  ON public.order_items 
  FOR SELECT 
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can manage all order items" 
  ON public.order_items 
  FOR ALL 
  USING (is_admin(auth.uid()));

-- Reviews table
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES public.products(id) NOT NULL,
  user_id UUID REFERENCES public.users(id) NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Create policies for reviews table
CREATE POLICY "Reviews are viewable by everyone" 
  ON public.reviews 
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can create their own reviews" 
  ON public.reviews 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews" 
  ON public.reviews 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews" 
  ON public.reviews 
  FOR DELETE 
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all reviews" 
  ON public.reviews 
  FOR ALL 
  USING (is_admin(auth.uid()));

-- Feedback table
CREATE TABLE IF NOT EXISTS public.feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id),
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('suggestion', 'bug', 'question', 'other')),
  status TEXT NOT NULL CHECK (status IN ('new', 'in_progress', 'resolved')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- Create policies for feedback table
CREATE POLICY "Users can create feedback" 
  ON public.feedback 
  FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can view their own feedback" 
  ON public.feedback 
  FOR SELECT 
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Admins can view all feedback" 
  ON public.feedback 
  FOR SELECT 
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can update feedback" 
  ON public.feedback 
  FOR UPDATE 
  USING (is_admin(auth.uid()));

-- Blog categories table
CREATE TABLE IF NOT EXISTS public.blog_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.blog_categories ENABLE ROW LEVEL SECURITY;

-- Create policies for blog_categories table
CREATE POLICY "Blog categories are viewable by everyone" 
  ON public.blog_categories 
  FOR SELECT 
  USING (true);

CREATE POLICY "Blog categories are editable by admins only" 
  ON public.blog_categories 
  FOR ALL 
  USING (is_admin(auth.uid()));

-- Blog posts table
CREATE TABLE IF NOT EXISTS public.blog_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT NOT NULL,
  excerpt TEXT,
  featured_image TEXT,
  author_id UUID REFERENCES public.users(id),
  category_id UUID REFERENCES public.blog_categories(id),
  published BOOLEAN DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Create policies for blog_posts table
CREATE POLICY "Published blog posts are viewable by everyone" 
  ON public.blog_posts 
  FOR SELECT 
  USING (published = true);

CREATE POLICY "Unpublished blog posts are viewable by their authors and admins" 
  ON public.blog_posts 
  FOR SELECT 
  USING (
    auth.uid() = author_id OR 
    is_admin(auth.uid())
  );

CREATE POLICY "Blog posts are editable by their authors and admins" 
  ON public.blog_posts 
  FOR ALL 
  USING (
    auth.uid() = author_id OR 
    is_admin(auth.uid())
  );

-- Blog tags table
CREATE TABLE IF NOT EXISTS public.blog_tags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.blog_tags ENABLE ROW LEVEL SECURITY;

-- Create policies for blog_tags table
CREATE POLICY "Blog tags are viewable by everyone" 
  ON public.blog_tags 
  FOR SELECT 
  USING (true);

CREATE POLICY "Blog tags are editable by admins only" 
  ON public.blog_tags 
  FOR ALL 
  USING (is_admin(auth.uid()));

-- Blog posts <-> tags junction table
CREATE TABLE IF NOT EXISTS public.blog_posts_tags (
  post_id UUID REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES public.blog_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);

-- Enable Row Level Security
ALTER TABLE public.blog_posts_tags ENABLE ROW LEVEL SECURITY;

-- Create policies for blog_posts_tags table
CREATE POLICY "Blog post tags are viewable by everyone" 
  ON public.blog_posts_tags 
  FOR SELECT 
  USING (
    post_id IN (SELECT id FROM public.blog_posts WHERE published = true) OR
    post_id IN (
      SELECT id FROM public.blog_posts 
      WHERE auth.uid() = author_id OR 
            is_admin(auth.uid())
    )
  );

CREATE POLICY "Blog post tags are editable by post authors and admins" 
  ON public.blog_posts_tags 
  FOR ALL 
  USING (
    post_id IN (
      SELECT id FROM public.blog_posts 
      WHERE auth.uid() = author_id OR 
            is_admin(auth.uid())
    )
  );

-- Blog comments table
CREATE TABLE IF NOT EXISTS public.blog_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id),
  name TEXT, -- For non-logged in users
  email TEXT, -- For non-logged in users
  content TEXT NOT NULL,
  approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.blog_comments ENABLE ROW LEVEL SECURITY;

-- Create policies for blog_comments table
CREATE POLICY "Approved blog comments are viewable by everyone" 
  ON public.blog_comments 
  FOR SELECT 
  USING (approved = true);

CREATE POLICY "Unapproved blog comments are viewable by admins only" 
  ON public.blog_comments 
  FOR SELECT 
  USING (is_admin(auth.uid()));

CREATE POLICY "Blog comments are editable by their authors and admins" 
  ON public.blog_comments 
  FOR UPDATE 
  USING (
    (user_id IS NOT NULL AND auth.uid() = user_id) OR 
    is_admin(auth.uid())
  );

CREATE POLICY "Blog comments are deletable by their authors, post authors, and admins" 
  ON public.blog_comments 
  FOR DELETE 
  USING (
    (user_id IS NOT NULL AND auth.uid() = user_id) OR 
    auth.uid() IN (
      SELECT author_id FROM public.blog_posts WHERE id = post_id
    ) OR 
    is_admin(auth.uid())
  );

CREATE POLICY "Users can create blog comments" 
  ON public.blog_comments 
  FOR INSERT 
  WITH CHECK (
    post_id IN (SELECT id FROM public.blog_posts WHERE published = true)
  );

-- Site config table
CREATE TABLE IF NOT EXISTS public.site_config (
  id BIGINT PRIMARY KEY,
  config JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.site_config ENABLE ROW LEVEL SECURITY;

-- Create policies for site_config table
CREATE POLICY "Site config is viewable by everyone" 
  ON public.site_config 
  FOR SELECT 
  USING (true);

CREATE POLICY "Site config is editable by admins only" 
  ON public.site_config 
  FOR ALL 
  USING (is_admin(auth.uid()));

-- Insert default site configuration
INSERT INTO site_config (id, config)
VALUES (1, '{
  "name": "Dutch Seed Supply",
  "domain": "dutchseedsupply.com",
  "seo": {
    "defaultTitle": "Dutch Seed Supply | Premium Cannabis Seeds from the Netherlands",
    "defaultDescription": "High-quality cannabis seeds with authentic Dutch genetics. Feminized, autoflowering, and CBD-rich varieties for collectors and growers.",
    "defaultKeywords": "cannabis seeds, marijuana seeds, weed seeds, Dutch genetics, feminized seeds, autoflower seeds, CBD seeds, Amsterdam seeds",
    "ogImage": "/images/og-image-seeds.jpg"
  },
  "branding": {
    "logo": "/images/logo/dutchseedsupply-transaparante-achtergrond.png",
    "favicon": "/favicon-seeds.ico",
    "colors": {
      "primary": "#4D7C0F",
      "primaryLight": "#84CC16",
      "primaryDark": "#3F6212",
      "secondary": "#F59E0B",
      "secondaryLight": "#FBBF24",
      "secondaryDark": "#D97706",
      "accent": "#ECFCCB"
    },
    "fonts": {
      "heading": "Poppins, sans-serif",
      "body": "Open Sans, sans-serif",
      "accent": "Merriweather, serif"
    }
  },
  "social": {
    "facebook": "https://facebook.com/dutchseedsupply",
    "instagram": "https://instagram.com/dutchseedsupply",
    "twitter": "https://twitter.com/dutchseedsupply",
    "youtube": "https://youtube.com/dutchseedsupply",
    "linkedin": "https://linkedin.com/company/dutchseedsupply"
  },
  "contact": {
    "email": "support@dutchseedsupply.com",
    "phone": "+31 20 123 4567",
    "address": "Seed Street 42, 1012 AB Amsterdam, Netherlands"
  },
  "features": {
    "blog": true,
    "auth": true,
    "newsletter": true
  },
  "domains": {
    "dutchseedsupply.com": {
      "language": "en",
      "title": "Dutch Seed Supply | Premium Cannabis Seeds from the Netherlands",
      "description": "High-quality cannabis seeds with authentic Dutch genetics. Feminized, autoflowering, and CBD-rich varieties for collectors and growers.",
      "keywords": "cannabis seeds, marijuana seeds, weed seeds, Dutch genetics, feminized seeds, autoflower seeds, CBD seeds, Amsterdam seeds, english"
    },
    "dutchseedsupply.nl": {
      "language": "nl",
      "title": "Dutch Seed Supply | Premium Cannabis Zaden uit Nederland",
      "description": "Hoogwaardige cannabis zaden met authentieke Nederlandse genetica. Gefeminiseerde, autoflowering en CBD-rijke variëteiten voor verzamelaars en kwekers.",
      "keywords": "cannabis zaden, wiet zaden, marihuana zaden, Nederlandse genetica, gefeminiseerde zaden, autoflower zaden, CBD zaden, Amsterdam"
    },
    "dutchseedsupply.de": {
      "language": "de",
      "title": "Dutch Seed Supply | Premium Cannabis Samen aus den Niederlanden",
      "description": "Hochwertige Cannabis-Samen mit authentischer niederländischer Genetik. Feminisierte, automatisch blühende und CBD-reiche Sorten für Sammler und Züchter.",
      "keywords": "Cannabis Samen, Marihuana Samen, niederländische Genetik, feminisierte Samen, Autoflower Samen, CBD Samen, Amsterdam"
    },
    "dutchseedsupply.fr": {
      "language": "fr",
      "title": "Dutch Seed Supply | Graines de Cannabis Premium des Pays-Bas",
      "description": "Graines de cannabis de haute qualité avec une génétique néerlandaise authentique. Variétés féminisées, à floraison automatique et riches en CBD pour les collectionneurs et les cultivateurs.",
      "keywords": "graines de cannabis, graines de marijuana, génétique néerlandaise, graines féminisées, graines autofloraison, graines CBD, Amsterdam"
    }
  },
  "notificationBars": {
    "top": {
      "message": "Free & Discreet Shipping on orders over €50",
      "bgColor": "bg-lime-100",
      "textColor": "text-lime-800"
    },
    "bottom": {
      "message": "Dutch Seed Supply - Premium cannabis seeds with authentic Dutch genetics",
      "bgColor": "bg-primary-100",
      "textColor": "text-primary-800"
    }
  }
}')
ON CONFLICT (id) DO NOTHING;

-- Create a function to update the updated_at timestamp for site_config
CREATE OR REPLACE FUNCTION update_site_config_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to call the function
CREATE TRIGGER update_site_config_updated_at
BEFORE UPDATE ON site_config
FOR EACH ROW
EXECUTE FUNCTION update_site_config_updated_at();

-- Create function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, is_admin)
  VALUES (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'full_name',
    COALESCE((new.raw_user_meta_data->>'is_admin')::boolean, false)
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_category_id ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_is_featured ON public.products(is_featured);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON public.reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON public.reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category_id ON public.blog_posts(category_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_author_id ON public.blog_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON public.blog_posts(published);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON public.blog_posts(published_at);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON public.blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_categories_slug ON public.blog_categories(slug);
CREATE INDEX IF NOT EXISTS idx_blog_tags_slug ON public.blog_tags(slug);
CREATE INDEX IF NOT EXISTS idx_blog_comments_post_id ON public.blog_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_blog_comments_user_id ON public.blog_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_blog_comments_approved ON public.blog_comments(approved);

-- Make the admin user
UPDATE public.users
SET is_admin = true
WHERE email = 'marvinsmit1988@gmail.com';
