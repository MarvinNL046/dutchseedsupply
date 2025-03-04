import Link from 'next/link';
import Image from 'next/image';
import { useSiteConfig } from '../../lib/use-site-config';
import { CountryFlags } from '../ui/CountryFlags';
import defaultConfig from '../../lib/site-config';

/**
 * Header component with navigation
 */
export const Header = () => {
  const { config, loading: configLoading } = useSiteConfig();
  
  // Navigation items
  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/products', label: 'Products' },
    { href: '/about', label: 'About Us' },
    { href: '/blog', label: 'Blog' },
    { href: '/contact', label: 'Contact' }
  ];
  
  return (
    <header className="bg-white shadow-sm">
      <div className="container-custom py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            {configLoading ? (
              <span className="text-2xl font-heading font-bold text-primary">{defaultConfig.name}</span>
            ) : (
              config.branding.logo ? (
                <div className="h-12 w-auto relative">
                  <Image 
                    src={config.branding.logo} 
                    alt={config.name}
                    width={180}
                    height={48}
                    className="h-full w-auto object-contain"
                  />
                </div>
              ) : (
                <span className="text-2xl font-heading font-bold text-primary">{config.name}</span>
              )
            )}
          </Link>
          
          {/* Country Flags */}
          <div className="hidden md:block">
            <CountryFlags />
          </div>
          
          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <Link 
                key={item.href}
                href={item.href} 
                className="text-primary-dark hover:text-primary transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          
          {/* Right side: Admin and Cart */}
          <div className="flex items-center space-x-4">
            {/* Admin Link */}
            <Link 
              href="/admin"
              className="text-primary-dark hover:text-primary flex items-center"
              title="Admin"
            >
              <span className="material-icons" style={{ fontSize: '24px' }}>admin_panel_settings</span>
              <span className="ml-1 hidden md:inline-block text-sm">Admin</span>
            </Link>
            
            {/* Cart Icon */}
            <Link 
              href="/cart"
              className="text-primary-dark hover:text-primary relative"
              aria-label="View cart"
            >
              <span className="material-icons" style={{ fontSize: '24px' }}>shopping_cart</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};
