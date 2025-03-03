'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { SiteConfig } from './site-config';
import defaultConfig from './site-config';

// Define the context type
type SiteConfigContextType = {
  config: SiteConfig;
  loading: boolean;
  error: Error | null;
  refreshConfig: () => Promise<void>;
};

// Create the context with default values
const SiteConfigContext = createContext<SiteConfigContextType>({
  config: defaultConfig,
  loading: true,
  error: null,
  refreshConfig: async () => {},
});

// Cache key for localStorage
const CACHE_KEY = 'site_config_cache';
// Cache duration in milliseconds (1 hour)
const CACHE_DURATION = 60 * 60 * 1000;

/**
 * Provider component for site configuration
 */
export function SiteConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<SiteConfig>(defaultConfig);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Function to fetch the configuration
  const fetchConfig = async () => {
    try {
      setLoading(true);
      
      // Try to get from localStorage first
      const cachedData = localStorage.getItem(CACHE_KEY);
      if (cachedData) {
        const { data, timestamp } = JSON.parse(cachedData);
        
        // Check if cache is still valid
        if (Date.now() - timestamp < CACHE_DURATION) {
          setConfig(data);
          setLoading(false);
          return;
        }
      }
      
      // Fetch from API if cache is invalid or doesn't exist
      const response = await fetch('/api/site-config', {
        headers: {
          'Cache-Control': 'no-cache',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch site configuration');
      }
      
      const data = await response.json();
      setConfig(data);
      
      // Save to localStorage with timestamp
      localStorage.setItem(
        CACHE_KEY,
        JSON.stringify({
          data,
          timestamp: Date.now(),
        })
      );
    } catch (err) {
      console.error('Error fetching site config:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      
      // Try to use cached data even if it's expired
      const cachedData = localStorage.getItem(CACHE_KEY);
      if (cachedData) {
        try {
          const { data } = JSON.parse(cachedData);
          setConfig(data);
        } catch (cacheErr) {
          console.error('Error parsing cached config:', cacheErr);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch config on initial render
  useEffect(() => {
    fetchConfig();
  }, []);

  // Context value
  const contextValue: SiteConfigContextType = {
    config,
    loading,
    error,
    refreshConfig: fetchConfig,
  };

  return (
    <SiteConfigContext.Provider value={contextValue}>
      {children}
    </SiteConfigContext.Provider>
  );
}

/**
 * Hook to use the site configuration
 */
export function useSiteConfig() {
  const context = useContext(SiteConfigContext);
  
  if (context === undefined) {
    throw new Error('useSiteConfig must be used within a SiteConfigProvider');
  }
  
  return context;
}
