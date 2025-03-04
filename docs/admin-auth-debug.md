# Admin Authentication Debugging Guide

This document provides instructions for debugging and fixing the infinite loop issue with admin authentication.

## The Problem

When trying to access the admin dashboard at `/admin`, the page gets stuck in an infinite loop during authentication. This can happen for several reasons:

1. Inconsistencies between client-side and server-side authentication state
2. Issues with the middleware redirecting back and forth
3. Problems with the admin layout component's authentication check
4. Database access issues when checking if a user is an admin

## Debugging Tools

We've created several debugging tools to help diagnose and fix the issue:

### 1. Debug Pages

- **Client-side Debug Page**: `/admin/auth-debug`
  - Shows client-side authentication state
  - Allows manual testing of authentication

- **Server-side Debug Page**: `/admin/server-debug`
  - Shows server-side authentication state
  - Displays environment variables and admin configuration

- **Login Debug Page**: `/login/debug-page`
  - Enhanced login page with detailed authentication information
  - Shows session and user details
  - Provides manual redirect controls

### 2. Debug Middleware

A modified version of the middleware that:
- Disables redirects for admin routes to break the infinite loop
- Adds detailed debug headers to help diagnose authentication issues
- Allows access to debug pages without authentication

## How to Use These Tools

### Step 1: Apply the Debug Middleware

Run the following command to replace the current middleware with the debug version:

```bash
node scripts/apply-debug-middleware.js
```

This will:
- Back up your original middleware to `middleware.original.ts`
- Replace it with the debug version
- Create a restore script to revert the changes later

### Step 2: Access the Debug Pages

With the debug middleware in place, you can now access the debug pages:

1. **Client-side Debug**: Visit `/admin/auth-debug` to see client-side authentication state
2. **Server-side Debug**: Visit `/admin/server-debug` to see server-side authentication state
3. **Login Debug**: Visit `/login/debug-page` to debug the login process

### Step 3: Analyze the Results

Look for inconsistencies between:
- Client-side and server-side authentication state
- Session data and user data
- Database admin status and authentication checks

Common issues to look for:
- Missing or expired session
- User exists but is not recognized as an admin
- Database errors when checking admin status
- Cookie issues preventing proper authentication

### Step 4: Fix the Issue

Based on your findings, you can:

1. **Update RLS Policies**: If there are database access issues, use the SQL scripts in the `supabase` directory to fix RLS policies
2. **Fix Authentication Logic**: If there are inconsistencies in how admin status is checked, update the middleware and layout components
3. **Clear Browser Data**: If there are cookie or session issues, clear browser cookies and local storage

### Step 5: Restore Original Middleware

Once the issue is fixed, restore the original middleware:

```bash
node scripts/restore-original-middleware.js
```

## Permanent Solution

After identifying the root cause, consider implementing one of these permanent solutions:

1. **Simplify Authentication Flow**: Reduce the number of authentication checks to avoid redundancy
2. **Standardize Admin Checks**: Use a single, consistent method to check if a user is an admin
3. **Add Error Handling**: Improve error handling to prevent infinite loops
4. **Use Debug Mode**: Add a debug mode flag that can be enabled in development to bypass authentication

## Troubleshooting

If you're still experiencing issues:

1. **Check Browser Console**: Look for errors or warnings in the browser console
2. **Check Server Logs**: Look for errors in the server logs
3. **Try Incognito Mode**: Test in an incognito/private window to rule out browser extension issues
4. **Clear All Cookies**: Clear all cookies and local storage for the site
5. **Restart the Development Server**: Sometimes a simple restart can fix issues
