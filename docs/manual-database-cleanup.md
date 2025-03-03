# Handmatige Database Opschoning voor Dutch Seed Supply

Omdat we de execute_sql functie niet automatisch kunnen creëren, moet je de volgende stappen handmatig uitvoeren om de database op te schonen.

## Stap 1: Creëer de execute_sql functie

1. Ga naar je [Supabase Dashboard](https://app.supabase.com)
2. Selecteer je project
3. Ga naar de SQL Editor
4. Maak een nieuwe query aan
5. Kopieer en plak de volgende SQL:

```sql
-- Create a function to execute arbitrary SQL
CREATE OR REPLACE FUNCTION execute_sql(sql_query TEXT)
RETURNS VOID AS $$
BEGIN
  EXECUTE sql_query;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION execute_sql(TEXT) TO authenticated;

-- Grant execute permission to anon users (if needed)
GRANT EXECUTE ON FUNCTION execute_sql(TEXT) TO anon;
```

6. Voer de query uit door op de "Run" knop te klikken

## Stap 2: Verwijder order_items en products

1. Maak een nieuwe query aan in de SQL Editor
2. Kopieer en plak de volgende SQL:

```sql
-- First, delete all order_items to remove foreign key constraints
DELETE FROM order_items;

-- Then, delete all products
DELETE FROM products;

-- Check if sequences exist before resetting them
DO $$
BEGIN
    -- Reset the sequence for products table if it exists
    IF EXISTS (SELECT 1 FROM pg_sequences WHERE schemaname = 'public' AND sequencename = 'products_id_seq') THEN
        ALTER SEQUENCE products_id_seq RESTART WITH 1;
    END IF;
    
    -- Reset the sequence for order_items table if it exists
    IF EXISTS (SELECT 1 FROM pg_sequences WHERE schemaname = 'public' AND sequencename = 'order_items_id_seq') THEN
        ALTER SEQUENCE order_items_id_seq RESTART WITH 1;
    END IF;
    
    -- Alternative sequence names to check (sometimes they use table_column_seq naming pattern)
    IF EXISTS (SELECT 1 FROM pg_sequences WHERE schemaname = 'public' AND sequencename = 'products_id_seq') THEN
        ALTER SEQUENCE products_id_seq RESTART WITH 1;
    ELSIF EXISTS (SELECT 1 FROM pg_sequences WHERE schemaname = 'public' AND sequencename = 'product_id_seq') THEN
        ALTER SEQUENCE product_id_seq RESTART WITH 1;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_sequences WHERE schemaname = 'public' AND sequencename = 'order_items_id_seq') THEN
        ALTER SEQUENCE order_items_id_seq RESTART WITH 1;
    ELSIF EXISTS (SELECT 1 FROM pg_sequences WHERE schemaname = 'public' AND sequencename = 'order_item_id_seq') THEN
        ALTER SEQUENCE order_item_id_seq RESTART WITH 1;
    END IF;
END $$;
```

3. Voer de query uit door op de "Run" knop te klikken

## Stap 3: Voeg de site_config toe

1. Maak een nieuwe query aan in de SQL Editor
2. Kopieer en plak de volgende SQL:

```sql
-- Create site_config table if it doesn't exist
CREATE TABLE IF NOT EXISTS site_config (
  id BIGINT PRIMARY KEY,
  config JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Delete existing config
DELETE FROM site_config;

-- Insert Dutch Seed Supply configuration
INSERT INTO site_config (id, config)
VALUES (1, '{
  "name": "Dutch Seed Supply",
  "domain": "dutchseedsupply.com",
  "seo": {
    "defaultTitle": "Dutch Seed Supply | Premium Cannabis Seeds from the Netherlands",
    "defaultDescription": "High-quality cannabis seeds with authentic Dutch genetics. Feminized, autoflowering, and CBD-rich varieties for collectors and growers.",
    "defaultKeywords": "cannabis seeds, marijuana seeds, weed seeds, Dutch genetics, feminized seeds, autoflower seeds, CBD seeds, Amsterdam seeds"
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
  "contact": {
    "email": "support@dutchseedsupply.com",
    "phone": "+31 20 123 4567",
    "address": "Seed Street 42, 1012 AB Amsterdam, Netherlands"
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
}');
```

3. Voer de query uit door op de "Run" knop te klikken

## Stap 4: Verifieer de opschoning

1. Maak een nieuwe query aan in de SQL Editor
2. Kopieer en plak de volgende SQL:

```sql
-- Check if order_items is empty
SELECT COUNT(*) FROM order_items;

-- Check if products is empty
SELECT COUNT(*) FROM products;

-- Check if site_config exists and has the correct data
SELECT * FROM site_config;
```

3. Voer de query uit door op de "Run" knop te klikken
4. Controleer of de resultaten correct zijn:
   - order_items count moet 0 zijn
   - products count moet 0 zijn
   - site_config moet 1 rij bevatten met de Dutch Seed Supply configuratie

## Stap 5: Start de ontwikkelingsserver opnieuw

1. Stop de huidige ontwikkelingsserver (als deze draait) met Ctrl+C
2. Start de ontwikkelingsserver opnieuw:

```bash
npm run dev
```

3. Navigeer naar http://localhost:3000 om te controleren of de site correct werkt
4. Ga naar http://localhost:3000/admin/products om nieuwe cannabis zaden producten toe te voegen

## Problemen oplossen

Als je problemen ondervindt bij het uitvoeren van de SQL queries:

1. Controleer of je voldoende rechten hebt in de Supabase database
2. Controleer of de tabellen order_items en products bestaan
3. Als een tabel niet bestaat, kun je de foutmelding negeren en doorgaan met de volgende stap
4. Als je problemen hebt met de site_config tabel, controleer dan of de JSON syntax correct is
