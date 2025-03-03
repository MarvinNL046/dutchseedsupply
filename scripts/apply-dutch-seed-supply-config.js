/**
 * Script to apply the Dutch Seed Supply configuration directly
 */

const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: '.env.local' });

// Dutch Seed Supply configuration
const config = {
  name: "Dutch Seed Supply",
  domain: "dutchseedsupply.com",
  
  seo: {
    defaultTitle: "Dutch Seed Supply | Premium Cannabis Seeds from the Netherlands",
    defaultDescription: "High-quality cannabis seeds with authentic Dutch genetics. Feminized, autoflowering, and CBD-rich varieties for collectors and growers.",
    defaultKeywords: "cannabis seeds, marijuana seeds, weed seeds, Dutch genetics, feminized seeds, autoflower seeds, CBD seeds, Amsterdam seeds",
    ogImage: "/images/og-image-seeds.jpg"
  },
  
  branding: {
    logo: "/images/logo/dutchseedsupply-transaparante-achtergrond.png",
    favicon: "/favicon-seeds.ico",
    colors: {
      primary: "#4D7C0F", // Olive green
      primaryLight: "#84CC16", // Lime green
      primaryDark: "#3F6212", // Dark olive
      secondary: "#F59E0B", // Amber
      secondaryLight: "#FBBF24", // Light amber
      secondaryDark: "#D97706", // Dark amber
      accent: "#ECFCCB" // Light lime
    },
    fonts: {
      heading: "Poppins, sans-serif",
      body: "Open Sans, sans-serif",
      accent: "Merriweather, serif"
    }
  },
  
  social: {
    facebook: "https://facebook.com/dutchseedsupply",
    instagram: "https://instagram.com/dutchseedsupply",
    twitter: "https://twitter.com/dutchseedsupply",
    youtube: "https://youtube.com/dutchseedsupply",
    linkedin: "https://linkedin.com/company/dutchseedsupply"
  },
  
  contact: {
    email: "support@dutchseedsupply.com",
    phone: "+31 20 123 4567",
    address: "Seed Street 42, 1012 AB Amsterdam, Netherlands"
  },
  
  features: {
    blog: true,
    auth: true,
    newsletter: true
  },
  
  // Domain-specific configuration for different languages
  domains: {
    "dutchseedsupply.com": {
      language: "en",
      title: "Dutch Seed Supply | Premium Cannabis Seeds from the Netherlands",
      description: "High-quality cannabis seeds with authentic Dutch genetics. Feminized, autoflowering, and CBD-rich varieties for collectors and growers.",
      keywords: "cannabis seeds, marijuana seeds, weed seeds, Dutch genetics, feminized seeds, autoflower seeds, CBD seeds, Amsterdam seeds, english"
    },
    "dutchseedsupply.nl": {
      language: "nl",
      title: "Dutch Seed Supply | Premium Cannabis Zaden uit Nederland",
      description: "Hoogwaardige cannabis zaden met authentieke Nederlandse genetica. Gefeminiseerde, autoflowering en CBD-rijke variëteiten voor verzamelaars en kwekers.",
      keywords: "cannabis zaden, wiet zaden, marihuana zaden, Nederlandse genetica, gefeminiseerde zaden, autoflower zaden, CBD zaden, Amsterdam"
    },
    "dutchseedsupply.de": {
      language: "de",
      title: "Dutch Seed Supply | Premium Cannabis Samen aus den Niederlanden",
      description: "Hochwertige Cannabis-Samen mit authentischer niederländischer Genetik. Feminisierte, automatisch blühende und CBD-reiche Sorten für Sammler und Züchter.",
      keywords: "Cannabis Samen, Marihuana Samen, niederländische Genetik, feminisierte Samen, Autoflower Samen, CBD Samen, Amsterdam"
    },
    "dutchseedsupply.fr": {
      language: "fr",
      title: "Dutch Seed Supply | Graines de Cannabis Premium des Pays-Bas",
      description: "Graines de cannabis de haute qualité avec une génétique néerlandaise authentique. Variétés féminisées, à floraison automatique et riches en CBD pour les collectionneurs et les cultivateurs.",
      keywords: "graines de cannabis, graines de marijuana, génétique néerlandaise, graines féminisées, graines autofloraison, graines CBD, Amsterdam"
    }
  },
  
  notificationBars: {
    top: {
      message: "Free & Discreet Shipping on orders over €50",
      bgColor: "bg-lime-100",
      textColor: "text-lime-800"
    },
    bottom: {
      message: "Dutch Seed Supply - Premium cannabis seeds with authentic Dutch genetics",
      bgColor: "bg-primary-100",
      textColor: "text-primary-800"
    }
  }
};

async function main() {
  try {
    console.log('Applying Dutch Seed Supply configuration...');
    
    // Connect to Supabase
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );
    
    // Check if the site_config table exists
    const { error: tableCheckError } = await supabase
      .from('site_config')
      .select('id')
      .limit(1);
    
    // If the table doesn't exist, create it
    if (tableCheckError && tableCheckError.message.includes('does not exist')) {
      console.log('Creating site_config table...');
      
      // Create the table using SQL
      const { error: createTableError } = await supabase.rpc('create_site_config_table');
      
      if (createTableError) {
        console.error('Error creating site_config table:', createTableError);
        process.exit(1);
      }
      
      console.log('site_config table created successfully');
    }
    
    // Upsert the configuration
    console.log('Saving configuration to database...');
    const { error } = await supabase
      .from('site_config')
      .upsert({ id: 1, config });
    
    if (error) {
      console.error('Error saving configuration:', error);
      process.exit(1);
    }
    
    console.log('Configuration saved to database successfully');
    
    // Run the config:apply script to apply the changes
    console.log('Applying configuration changes...');
    const { execSync } = require('child_process');
    execSync('npm run config:apply', { stdio: 'inherit' });
    
    console.log('Configuration applied successfully');
  } catch (error) {
    console.error('Error applying configuration:', error);
    process.exit(1);
  }
}

// Run the main function
main();
