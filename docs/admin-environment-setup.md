# Admin Environment Setup Guide

This document provides instructions on how to set up and fix the admin environment for the DutchSeedSupply webshop.

## Overview

The admin environment allows authorized users to manage products, orders, users, and other aspects of the webshop. It's protected by authentication to ensure only admin users can access it.

## Prerequisites

Before setting up the admin environment, make sure you have:

1. A Supabase account with access to the project
2. The `.env.local` file with the following environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_KEY`
   - `ADMIN_EMAILS` (comma-separated list of admin email addresses)

## Setup Steps

### 1. Fix Supabase RLS Policies

The admin environment may have issues with Row Level Security (RLS) policies that cause infinite recursion. To fix this:

```bash
# Run the script to apply the admin policies
node scripts/apply-admin-policies.js
```

This script executes the SQL migration in `supabase/migrations/20250302_fix_admin_policies.sql`, which:
- Creates a `is_admin` function that avoids RLS recursion
- Sets up proper RLS policies for admin users
- Ensures the admin user is properly set in the database

### 2. Configure Admin Authentication

The admin authentication is handled at two levels:

1. **Middleware Level** (`middleware.ts`):
   - Intercepts all requests to `/admin` routes
   - Checks if the user is authenticated and has admin role
   - Redirects to login page if not authenticated
   - Redirects to homepage if authenticated but not admin
   - Has DEBUG_MODE that bypasses authentication checks in development

2. **Layout Level** (`app/(admin)/layout.tsx` using `utils/supabase/server.ts`):
   - Server-side authentication checks using the App Router
   - Support for admin users defined in the `ADMIN_EMAILS` environment variable
   - Database checks for the `is_admin` flag
   - Has DEBUG_MODE that bypasses authentication checks in development

Make sure your email is included in the `ADMIN_EMAILS` environment variable or your user has the `is_admin` flag set to `true` in the database.

### 3. Access the Admin Dashboard

Once the setup is complete, you can access the admin dashboard at:

```
http://localhost:3000/admin
```

Or on the production site:

```
https://dutchseedsupply.com/admin
```

Admin users will also see an "Admin Dashboard" link in their account dropdown menu.

## Troubleshooting

### Authentication Issues

If you're having trouble accessing the admin dashboard:

1. Check that your email is in the `ADMIN_EMAILS` environment variable
2. Verify that your user has the `is_admin` flag set to `true` in the database
3. Check the browser console and server logs for errors
4. Try running the `apply-admin-policies.js` script again

### Database Connection Issues

If the admin dashboard shows database connection errors:

1. Verify that your Supabase credentials are correct in `.env.local`
2. Check that the Supabase service is running
3. Ensure that the RLS policies are correctly applied

### Debug Mode

In development, the admin environment has a debug mode that bypasses authentication checks. This is indicated by a yellow banner at the top of the page.

Debug mode is automatically enabled in development environment (`process.env.NODE_ENV === 'development'`) in both:
- `middleware.ts` - Bypasses middleware authentication checks
- `utils/supabase/server.ts` - Bypasses server-side authentication checks

To disable debug mode in development, you can set `DEBUG_MODE` to `false` in both files:
```javascript
// Set this to false to disable debug mode in development
const DEBUG_MODE = process.env.NODE_ENV === 'development' && false;
```

Debug mode should never be enabled in production.

## Security Considerations

- Never enable debug mode in production
- Keep the `SUPABASE_SERVICE_KEY` secret and never expose it to the client
- Regularly review the list of admin users
- Consider implementing additional security measures like two-factor authentication for admin users
