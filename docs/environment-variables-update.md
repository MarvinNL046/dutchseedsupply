# Environment Variables Update

This document explains the changes made to support both the original and Vercel naming conventions for environment variables.

## Overview

To ensure compatibility with Vercel's environment variable naming conventions, we've updated the application to support both the original naming conventions and the alternative naming conventions used by Vercel. This allows the application to run smoothly in both local development and Vercel deployment environments.

## Changes Made

### 1. Environment Variables

We've updated the `.env.local` and `.env.local.example` files to include both naming conventions:

**Original naming:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_KEY`

**Alternative naming (Vercel):**
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_JWT_SECRET`
- Various PostgreSQL variables

### 2. Code Updates

We've updated the following files to support both naming conventions:

#### lib/supabase.ts
```typescript
// Get Supabase URL from environment variables (support both naming conventions)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;

// Get Supabase key from environment variables (support both naming conventions)
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
```

#### utils/supabase/client.ts
```typescript
// Support both naming conventions for Supabase URL and key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
```

#### utils/supabase/middleware.ts
```typescript
// Support both naming conventions for Supabase URL and key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
```

#### utils/supabase/server.ts
```typescript
// Support both naming conventions for Supabase URL and key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
```

#### middleware.ts
```typescript
// Support both naming conventions for Supabase URL and key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
```

#### scripts/make-admin.js
```javascript
// Check for required environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
```

### 3. Documentation Updates

We've updated the documentation to reflect these changes:

- `docs/vercel-deployment-environment.md`: Added information about the alternative naming conventions and how to set them up in Vercel.

## Benefits

These changes provide the following benefits:

1. **Compatibility**: The application now works seamlessly with both local development and Vercel deployment environments.
2. **Flexibility**: Users can choose which naming convention to use based on their preferences or requirements.
3. **Resilience**: The application is more resilient to missing environment variables, as it can fall back to alternative names.

## Testing

To test these changes:

1. Run the application locally with the original naming convention.
2. Run the application locally with the alternative naming convention.
3. Deploy the application to Vercel with the alternative naming convention.

All three scenarios should work without any issues.
