import { createClient } from '@supabase/supabase-js';
import { headers } from 'next/headers';
import defaultConfig, { SiteConfig } from './site-config';

// Force dynamic rendering for this file
export const dynamic = 'force-dynamic';

let cachedConfig: SiteConfig | null = null;
let cacheTime = 0;
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

// Get the current hostname from the request headers
function getCurrentHostname(): string {
  try {
    // In static contexts, headers() will throw an error
    // We need to handle this gracefully
    const headersList = headers();
    const host = headersList.get('host') || '';
    
    // Remove port if present
    return host.split(':')[0];
  } catch (error) {
    console.error('Error getting hostname:', error);
    // Return a default hostname for static generation
    return process.env.SITE_DOMAIN || 'dutchseedsupply.com';
  }
}

// Get domain-specific configuration based on hostname
function getDomainConfig(config: SiteConfig, hostname: string): SiteConfig {
  if (!config.domains || !hostname) {
    return config;
  }
  
  // Find the domain configuration that matches the hostname
  const domainConfig = config.domains[hostname];
  if (!domainConfig) {
    // Try to match without subdomain (e.g., www.example.com -> example.com)
    const baseDomain = hostname.split('.').slice(-2).join('.');
    const baseDomainConfig = config.domains[baseDomain];
    
    if (!baseDomainConfig) {
      return config;
    }
    
    // Apply base domain configuration
    return {
      ...config,
      seo: {
        ...config.seo,
        defaultTitle: baseDomainConfig.title,
        defaultDescription: baseDomainConfig.description,
        defaultKeywords: baseDomainConfig.keywords,
      }
    };
  }
  
  // Apply domain-specific configuration
  return {
    ...config,
    seo: {
      ...config.seo,
      defaultTitle: domainConfig.title,
      defaultDescription: domainConfig.description,
      defaultKeywords: domainConfig.keywords,
    }
  };
}

export async function getServerSideConfig(): Promise<SiteConfig> {
  // Return cached config if available and not expired
  if (cachedConfig && Date.now() - cacheTime < CACHE_DURATION) {
    // Apply domain-specific configuration to cached config
    const hostname = getCurrentHostname();
    return getDomainConfig(cachedConfig, hostname);
  }
  
  try {
    // Check if Supabase keys are available
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
      console.error('Error fetching site config: Supabase keys are not available');
      // Apply domain-specific configuration to default config
      const hostname = getCurrentHostname();
      return getDomainConfig(defaultConfig, hostname);
    }
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );
    
    const { data, error } = await supabase
      .from('site_config')
      .select('config')
      .eq('id', 1)
      .single();
    
    if (error || !data) {
      console.error('Error fetching site config:', error);
      // Apply domain-specific configuration to default config
      const hostname = getCurrentHostname();
      return getDomainConfig(defaultConfig, hostname);
    }
    
    // Update cache
    cachedConfig = data.config as SiteConfig;
    cacheTime = Date.now();
    
    // Apply domain-specific configuration
    const hostname = getCurrentHostname();
    return getDomainConfig(cachedConfig, hostname);
  } catch (error) {
    console.error('Error fetching site config:', error);
    // Apply domain-specific configuration to default config
    const hostname = getCurrentHostname();
    return getDomainConfig(defaultConfig, hostname);
  }
}

// Function to get config on the client side
export async function getClientSideConfig(): Promise<SiteConfig> {
  try {
    const response = await fetch('/api/site-config');
    if (!response.ok) {
      throw new Error('Failed to fetch site config');
    }
    
    // The API will handle applying domain-specific configuration
    return await response.json();
  } catch (error) {
    console.error('Error fetching client-side config:', error);
    return defaultConfig;
  }
}

// Export the utility functions for use in other server components
export { getCurrentHostname, getDomainConfig };
