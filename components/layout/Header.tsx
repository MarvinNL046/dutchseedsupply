import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '../../lib/auth-context';
import { useSiteConfig } from '../../lib/use-site-config';
import { CountryFlags } from '../ui/CountryFlags';
import { getAdminEmails } from '../../utils/admin-config';
import defaultConfig from '../../lib/site-config';

/**
 * Header component with navigation
 */
export const Header = () => {
  const { user, loading: authLoading } = useAuth();
  const { config, loading: configLoading } = useSiteConfig();
  
  // Check if user is admin
  const adminEmails = getAdminEmails();
  const isAdmin = user && user.email && adminEmails.includes(user.email);
  
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
          
          {/* Right side: Account and Cart */}
          <div className="flex items-center space-x-4">
            {/* Account Icon */}
            {!authLoading && (
              user ? (
                <div className="relative group">
                  <Link 
                    href="/account"
                    className="text-primary-dark hover:text-primary flex items-center"
                    title="My Account"
                  >
                    <span className="material-icons" style={{ fontSize: '24px' }}>account_circle</span>
                    <span className="ml-1 hidden md:inline-block text-sm">
                      {user.user_metadata?.full_name?.split(' ')[0] || 'Account'}
                    </span>
                  </Link>
                  
                  {/* Dropdown Menu */}
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white shadow-lg rounded-md overflow-hidden z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <div className="p-3 border-b">
                      <p className="text-sm font-medium">{user.email}</p>
                      <div className="flex items-center mt-1">
                        <span className="material-icons text-primary text-sm">redeem</span>
                        <span className="text-xs ml-1">Loyalty Points</span>
                      </div>
                    </div>
                    <div className="py-1">
                      <Link href="/account" className="block px-4 py-2 text-sm hover:bg-gray-100">My Account</Link>
                      <Link href="/account?tab=orders" className="block px-4 py-2 text-sm hover:bg-gray-100">My Orders</Link>
                      <Link href="/account?tab=loyalty" className="block px-4 py-2 text-sm hover:bg-gray-100">Loyalty Points</Link>
                      
                      {/* Admin link for admin users */}
                      {isAdmin && (
                        <>
                          <div className="px-4 py-1 border-t border-gray-100 mt-1"></div>
                          <Link href="/admin" className="block px-4 py-2 text-sm hover:bg-gray-100 text-primary font-medium flex items-center">
                            <span className="material-icons text-primary text-sm mr-1">admin_panel_settings</span>
                            Admin Dashboard
                          </Link>
                        </>
                      )}
                      
                      <button 
                        onClick={async () => {
                          const { signOut } = await import('../../lib/auth');
                          await signOut();
                          window.location.href = '/';
                        }}
                        className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-red-600"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <Link 
                  href="/login"
                  className="text-primary-dark hover:text-primary flex items-center"
                  title="Login"
                >
                  <span className="material-icons" style={{ fontSize: '24px' }}>person</span>
                  <span className="ml-1 hidden md:inline-block text-sm">Login</span>
                </Link>
              )
            )}
            
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
