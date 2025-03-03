/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://dutchseedsupply.com',
  generateRobotsTxt: true,
  sitemapSize: 7000,
  changefreq: 'daily',
  priority: 0.7,
  exclude: ['/account', '/cart', '/checkout'],
  transform: async (config, path) => {
    // Custom transformation for URLs
    
    // Skip excluded paths
    if (config.exclude.includes(path)) {
      return null;
    }
    
    // Set higher priority for important pages
    let priority = config.priority;
    if (path === '/') {
      priority = 1.0;
    } else if (path.includes('/products/') && !path.includes('/category/')) {
      // Product detail pages
      priority = 0.9;
    } else if (path.includes('/products/category/')) {
      // Category pages
      priority = 0.8;
    } else if (path === '/products' || path.startsWith('/products/')) {
      // Product listing pages
      priority = 0.8;
    }
    
    return {
      loc: path,
      changefreq: config.changefreq,
      priority,
      lastmod: new Date().toISOString(),
    };
  },
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/account', '/cart', '/checkout'],
      },
    ],
    additionalSitemaps: [
      'https://dutchseedsupply.com/api/sitemap', // For dynamically generated pages
    ],
  },
};
