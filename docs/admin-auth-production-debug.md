# Admin Authentication Production Debugging Guide

This document explains how to debug admin authentication issues in the production environment.

## The Problem

When trying to access the admin pages in production, you may encounter one of these issues:

1. **Infinite Redirect Loop**: The browser keeps redirecting between the login page and admin page
2. **Access Denied**: You're redirected to the homepage even though you're logged in as an admin
3. **Server-Side Authentication Failure**: The middleware allows access, but server-side checks still block access

## The Solution

We've created several tools to help debug and fix these issues:

### 1. Debug Middleware

The debug middleware allows access to admin pages without authentication checks at the middleware level. This is useful for bypassing the first layer of authentication.

To apply the debug middleware:

```bash
node scripts/apply-debug-admin-middleware.js
```

### 2. Enable DEBUG_MODE in Production

Even with the debug middleware, there's a second layer of authentication in the server-side components. We've created a script to enable DEBUG_MODE in production, which bypasses these server-side checks.

To enable DEBUG_MODE in production:

```bash
node scripts/enable-debug-mode-in-production.js
```

This script:
- Backs up the original `utils/supabase/server.ts` file
- Modifies the file to set `DEBUG_MODE = true` regardless of environment
- Creates a restore script to revert the changes when you're done debugging

### 3. Restore Original Files

After debugging, you can restore the original files:

```bash
# Restore the original middleware
node scripts/restore-current-middleware.js

# Restore the original server.ts file
node scripts/restore-server-file.js
```

## Deployment Process

After making these changes, you need to deploy them to production:

1. Commit and push the changes to GitHub:
   ```bash
   git add .
   git commit -m "Enable debug mode for admin authentication"
   git push
   ```

2. Deploy to Vercel:
   ```bash
   vercel --prod
   ```

   Or deploy from the Vercel dashboard.

## Verifying the Fix

After deploying, you should be able to access the admin pages in production without authentication. This confirms that the issue is with the authentication system and not with the admin pages themselves.

## Security Warning

**IMPORTANT**: These debug modes bypass all authentication checks. They should only be used temporarily for debugging purposes and should be disabled immediately after debugging is complete.

## Root Cause Analysis

The admin authentication system has two layers:

1. **Middleware Layer**: Checks the request and redirects unauthenticated users to the login page
2. **Server-Side Layer**: Checks the user's session and admin status in the database

Both layers need to be properly configured to allow admin access. The debug tools help identify which layer is causing the issue.

## Permanent Fix

Once you've identified the issue, you should implement a permanent fix:

1. If the issue is with the middleware, update the middleware to correctly handle admin authentication
2. If the issue is with the server-side checks, update the `checkAdminAuth` function in `utils/supabase/server.ts`
3. If the issue is with the database, ensure that your user has the correct admin privileges in the database

After implementing the permanent fix, remember to disable all debug modes before deploying to production.
