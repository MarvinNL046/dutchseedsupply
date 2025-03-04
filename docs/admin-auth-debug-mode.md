# Admin Authentication Debug Mode

This document explains how to use the ADMIN_DEBUG_MODE environment variable to control access to the admin panel.

## Overview

The admin panel authentication system has been updated to use a new environment variable called `ADMIN_DEBUG_MODE`. This variable allows you to enable or disable debug mode, which bypasses authentication checks and allows anyone to access the admin panel.

## How It Works

1. The `ADMIN_DEBUG_MODE` environment variable is checked in three key files:
   - `middleware.ts`
   - `utils/supabase/server.ts`
   - `lib/admin-auth-app-router.ts`

2. If `ADMIN_DEBUG_MODE` is set to `true`, authentication checks are bypassed and anyone can access the admin panel.

3. If `ADMIN_DEBUG_MODE` is not set or is set to `false`, the system falls back to checking if the environment is development (`process.env.NODE_ENV === 'development'`). In development, debug mode is enabled by default.

4. In production, if `ADMIN_DEBUG_MODE` is not set or is set to `false`, the system performs full authentication checks to ensure only admin users can access the admin panel.

## Configuration

To configure the admin authentication system, you can set the `ADMIN_DEBUG_MODE` environment variable in your `.env.local` file:

```
ADMIN_DEBUG_MODE=true  # Enable debug mode (bypass authentication)
```

or

```
ADMIN_DEBUG_MODE=false  # Disable debug mode (enforce authentication)
```

## Troubleshooting

If you're having trouble accessing the admin panel, here are some steps to troubleshoot:

1. Check if `ADMIN_DEBUG_MODE` is set to `true` in your `.env.local` file.
2. If you're in production and need temporary access, set `ADMIN_DEBUG_MODE=true` temporarily.
3. Check if your user has the `is_admin` flag set to `true` in the database.
4. Check if your user's email is in the `ADMIN_EMAILS` environment variable.
5. Use the auth-debug page to see detailed information about your authentication status.

## Security Considerations

- **IMPORTANT**: Do not leave `ADMIN_DEBUG_MODE=true` in production for extended periods. This bypasses all authentication checks and allows anyone to access the admin panel.
- When deploying to production, make sure to set `ADMIN_DEBUG_MODE=false` or remove it from your environment variables.
- Use the `ADMIN_EMAILS` environment variable to specify which email addresses should have admin access.
- Make sure your users have the `is_admin` flag set correctly in the database.

## Implementation Details

The admin authentication system uses a combination of middleware and server-side checks to ensure only admin users can access the admin panel:

1. **Middleware Check**: The `middleware.ts` file checks if the request is for an admin route and verifies the user's admin status.
2. **Server-Side Check**: The `utils/supabase/server.ts` file provides the `checkAdminAuth` function used by the admin layout.
3. **App Router Check**: The `lib/admin-auth-app-router.ts` file provides an alternative implementation of the `checkAdminAuth` function.

All three implementations now use the same logic to determine if debug mode is enabled, ensuring consistent behavior across the application.
