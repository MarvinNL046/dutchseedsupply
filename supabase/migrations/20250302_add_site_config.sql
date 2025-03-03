-- Create site_config table for storing whitelabel configuration
CREATE TABLE IF NOT EXISTS site_config (
  id BIGINT PRIMARY KEY,
  config JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default configuration
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

-- Create a function to update the updated_at timestamp
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

-- Create a function to create the site_config table if it doesn't exist
-- This is used by the API route when it needs to create the table
CREATE OR REPLACE FUNCTION create_site_config_table()
RETURNS VOID AS $$
BEGIN
  -- Create the table if it doesn't exist
  CREATE TABLE IF NOT EXISTS site_config (
    id BIGINT PRIMARY KEY,
    config JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
  
  -- Insert default configuration if not exists
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
  
  -- Create the trigger if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_site_config_updated_at'
  ) THEN
    CREATE TRIGGER update_site_config_updated_at
    BEFORE UPDATE ON site_config
    FOR EACH ROW
    EXECUTE FUNCTION update_site_config_updated_at();
  END IF;
END;
$$ LANGUAGE plpgsql;
