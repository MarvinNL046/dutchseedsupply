# Server-Side Authentication Implementation

This document explains the implementation of server-side authentication in the Dutch Seed Supply application.

## Overview

The authentication system has been updated to use server-side API routes for handling sensitive operations like sign-in and sign-up. This prevents sensitive information like passwords from being visible in network requests.

## Key Components

### API Routes

1. **`/api/auth/signin`**: Handles user sign-in on the server side
2. **`/api/auth/signup`**: Handles user registration on the server side
3. **`/api/auth/signout`**: Handles user sign-out on the server side

### Client-Side Authentication

The `lib/auth.ts` file has been updated to use these API routes instead of directly calling Supabase from the client. This ensures that passwords and other sensitive information are not visible in network requests.

### Admin Authentication

The admin authentication system has been updated to use environment variables for admin emails instead of hardcoded values. This improves security and makes the application more configurable.

## How It Works

1. When a user submits the login form, the client-side code sends a request to the `/api/auth/signin` API route
2. The API route handles the authentication on the server side using Supabase
3. The session is established using cookies, which are automatically included in subsequent requests
4. The client receives only the necessary user information, not the session token or other sensitive data

## Security Improvements

1. **Password Protection**: Passwords are no longer visible in network requests, as they are only sent to the server-side API routes
2. **No Hardcoded Credentials**: Admin emails are now managed through environment variables
3. **Server-Side Validation**: Input validation is performed on both client and server sides

## Configuration

Admin users can be configured in two ways:

1. **Environment Variables**: Set the `ADMIN_EMAILS` environment variable with a comma-separated list of admin email addresses
2. **Database**: Set the `is_admin` flag to `true` in the `users` table for specific users

## Debugging

In development mode, the application includes a debug mode that bypasses authentication checks for admin routes. This is only enabled in the development environment and is disabled in production.

## Future Improvements

1. Implement CSRF protection for the authentication API routes
2. Add rate limiting to prevent brute force attacks
3. Implement two-factor authentication
4. Add more comprehensive logging for security events
