import { ReactNode } from 'react';
import { Inter } from 'next/font/google';
import Link from 'next/link';
import { redirect } from 'next/navigation';

// Force dynamic rendering for admin routes
export const dynamic = 'force-dynamic';
import { 
  LayoutGrid, 
  Package, 
  FolderTree, 
  Globe, 
  ShoppingCart, 
  Users, 
  LogOut,
  FileText,
  RefreshCw
} from 'lucide-react';
import { ThemeProvider } from '../../components/ui/theme-provider';
import { ThemeToggle } from '../../components/ui/theme-toggle';
import { Toaster } from '../../components/ui/toaster';
import { checkAdminAuth } from '../../utils/supabase/server';
import { SiteConfigProvider } from '../../lib/site-config-context';
import '../../styles/globals.css';

const inter = Inter({ subsets: ['latin'] });

// Navigation items in Dutch
const navItems = [
  { href: '/admin', label: 'Dashboard', icon: <LayoutGrid className="w-5 h-5" /> },
  { href: '/admin/products', label: 'Producten', icon: <Package className="w-5 h-5" /> },
  { href: '/admin/categories', label: 'Categorieën', icon: <FolderTree className="w-5 h-5" /> },
  { href: '/admin/translations', label: 'Vertalingen', icon: <Globe className="w-5 h-5" /> },
  { href: '/admin/orders', label: 'Bestellingen', icon: <ShoppingCart className="w-5 h-5" /> },
  { href: '/admin/users', label: 'Gebruikers', icon: <Users className="w-5 h-5" /> },
  { href: '/admin/blog', label: 'Blog', icon: <FileText className="w-5 h-5" /> },
  { href: '/admin/cache', label: 'Cache', icon: <RefreshCw className="w-5 h-5" /> },
];

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  // Server-side admin check
  const { isAdmin, user, debugMode } = await checkAdminAuth();
  
  return (
    <html lang="nl" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
        <title>Dutch Seed Supply Admin</title>
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <SiteConfigProvider>
            <Toaster />
          <div className="flex h-screen bg-background text-foreground">
            {/* Debug mode banner - always shown for now */}
            <div className="fixed top-0 left-0 right-0 bg-yellow-500 text-white p-1 text-center text-xs z-50">
              {debugMode ? (
                <strong>DEBUG MODE ENABLED - Authentication checks are bypassed</strong>
              ) : (
                <>
                  Server-side admin check passed: {user?.email}
                </>
              )}
            </div>
            
            {/* Sidebar */}
            <div className="hidden md:flex md:flex-col md:w-64 md:fixed md:inset-y-0 bg-card shadow-md">
              <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto">
                <div className="flex items-center justify-between flex-shrink-0 px-4 mb-5">
                  <Link href="/admin" className="text-xl font-bold text-primary">
                    Dutch Seed Supply Admin
                  </Link>
                  <ThemeToggle />
                </div>
                
                <nav className="mt-5 flex-1 px-2 space-y-1">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-foreground hover:bg-accent hover:text-accent-foreground"
                    >
                      {item.icon}
                      <span className="ml-3">{item.label}</span>
                    </Link>
                  ))}
                </nav>
              </div>
              
              <div className="flex-shrink-0 flex border-t border-border p-4">
                {/* Use a simple link to the signout API route instead of a server action */}
                <Link 
                  href="/api/auth/signout"
                  className="flex-shrink-0 group block w-full"
                  onClick={(e) => {
                    e.preventDefault();
                    // Use fetch to call the signout API
                    fetch('/api/auth/signout', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                    }).then(() => {
                      // Redirect to home page after signing out
                      window.location.href = '/';
                    });
                  }}
                >
                  <div className="flex items-center">
                    <div className="ml-3">
                      <p className="text-sm font-medium text-foreground group-hover:text-foreground">
                        {user?.email || 'Debug User'}
                      </p>
                      <p className="text-xs font-medium text-muted-foreground group-hover:text-foreground flex items-center">
                        <LogOut className="w-3 h-3 mr-1" />
                        Uitloggen
                      </p>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
            
            {/* Mobile menu */}
            <div className="md:hidden fixed top-0 left-0 right-0 bg-card shadow-md z-40 pt-10">
              <div className="flex items-center justify-between px-4 py-2">
                <Link href="/admin" className="text-xl font-bold text-primary">
                  Dutch Seed Supply Admin
                </Link>
                <ThemeToggle />
              </div>
              <nav className="px-2 py-2 flex overflow-x-auto space-x-2">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex flex-col items-center p-2 text-xs font-medium rounded-md text-foreground hover:bg-accent hover:text-accent-foreground"
                  >
                    {item.icon}
                    <span className="mt-1">{item.label}</span>
                  </Link>
                ))}
              </nav>
            </div>
            
            {/* Main content */}
            <div className="md:pl-64 flex flex-col flex-1">
              <main className="flex-1">
                <div className="py-6 pt-16 md:pt-6">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 flex justify-between items-center">
                    <h1 className="text-2xl font-semibold text-foreground">Admin Beheer</h1>
                    <div className="md:hidden">
                      <ThemeToggle />
                    </div>
                  </div>
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mt-4">
                    {children}
                  </div>
                </div>
              </main>
            </div>
          </div>
          </SiteConfigProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
