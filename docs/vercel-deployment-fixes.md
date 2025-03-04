# Vercel Deployment Fixes

This document explains the fixes for the Vercel deployment issues.

## The Problem

When deploying to Vercel, the build process was failing with the following errors:

1. **Dynamic Server Usage Errors**:
   ```
   Dynamic server usage: Route couldn't be rendered statically because it used `headers`.
   ```
   This error occurred for multiple routes including `/`, `/login`, `/account`, etc.

2. **Missing Suspense Boundary**:
   ```
   useSearchParams() should be wrapped in a suspense boundary at page "/login/debug-page".
   ```

## The Solution

### 1. Add Dynamic Flags to Server Components

The main issue was that Vercel was trying to statically generate pages that use `headers()`, which is only available in server components. To fix this, we added the `dynamic = 'force-dynamic'` flag to the components that use `headers()`:

```typescript
// lib/site-config-server.ts
import { headers } from 'next/headers';

// Force dynamic rendering for this file
export const dynamic = 'force-dynamic';

// Rest of the file...
```

```typescript
// app/layout.tsx
// Force dynamic rendering for this layout
export const dynamic = 'force-dynamic';

// Rest of the file...
```

This tells Next.js to render these components on the server, which allows the use of `headers()` and other server-only features.

### 2. Wrap useSearchParams in Suspense

For the second issue, we wrapped the `useSearchParams()` hook in a Suspense boundary in the `/login/debug-page.tsx` file:

```jsx
// Main component with suspense boundary
export default function LoginDebugPage() {
  return (
    <Layout>
      <Suspense fallback={
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-center mb-8">Login Debug Page</h1>
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
              <p className="text-gray-600">Loading...</p>
            </div>
          </div>
        </div>
      }>
        <LoginContent />
      </Suspense>
    </Layout>
  );
}
```

This ensures that the page can handle the loading state properly when using `useSearchParams()`.

### 3. Clean Up Next.js Configuration

We also cleaned up the `next.config.js` file to remove deprecated options:

```javascript
// next.config.js
const nextConfig = {
  reactStrictMode: true,
  // Configure dynamic routes for admin and API routes
  images: {
    // Image configuration...
  },
  // Other configurations...
};
```

We removed the `experimental.serverActions` option since it's now enabled by default in Next.js 14+.

### 4. Fix Tailwind Theme Generator

We improved the error handling in the `scripts/generate-tailwind-theme.js` file to better handle parsing errors when loading the site configuration:

```javascript
try {
  // Use a safer approach than eval
  // First, clean up the string to make it valid JSON
  const cleanedString = configString
    .replace(/(\w+):/g, '"$1":') // Convert property names to quoted strings
    .replace(/'/g, '"'); // Replace single quotes with double quotes
  
  try {
    // Try to parse as JSON
    siteConfig = JSON.parse(cleanedString);
    console.log('Loaded site config from local file');
  } catch (jsonError) {
    // If JSON parsing fails, fall back to Function
    try {
      const configObj = Function(`return ${configString}`)();
      siteConfig = configObj;
      console.log('Loaded site config from local file using Function');
    } catch (funcError) {
      throw new Error(`Failed to parse config: ${funcError.message}`);
    }
  }
} catch (evalError) {
  console.error('Error parsing config from file:', evalError);
  // Fallback to default configuration...
}
```

This makes the build process more robust by providing multiple fallback mechanisms.

## Additional Notes

- These changes should not affect the functionality of the site, but they will change how pages are rendered (server-side instead of static).
- If you need to optimize performance in the future, you can selectively enable static generation for specific pages by adding `export const dynamic = 'force-static'` to those pages.

## Related Issues

These fixes are separate from the middleware fixes for the admin authentication infinite loop issue. However, both sets of changes are necessary for the site to work correctly in production.
