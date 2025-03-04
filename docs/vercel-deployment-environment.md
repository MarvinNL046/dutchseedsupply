# Vercel Deployment Environment Variables

This document explains how to set up the necessary environment variables for deploying the Dutch Seed Supply website to Vercel.

## Required Environment Variables

The following environment variables need to be configured in your Vercel project settings:

### Supabase Configuration

These variables are required for connecting to your Supabase database:

- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key (public)
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key (private)

#### Alternative Naming Conventions

Vercel may use different naming conventions for some environment variables. The application supports both naming conventions:

- `SUPABASE_URL`: Alternative to `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_ANON_KEY`: Alternative to `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_JWT_SECRET`: JWT secret for Supabase (if needed)

### Admin Configuration

- `ADMIN_EMAILS`: Comma-separated list of admin email addresses
- `ADMIN_DEBUG_MODE`: Set to 'true' to bypass authentication checks (use with caution in production)

### Site Configuration

- `SITE_NAME`: The name of your site (e.g., "Dutch Seed Supply")
- `SITE_DOMAIN`: The domain of your site (e.g., "dutchseedsupply.com")
- `SITE_DESCRIPTION`: A brief description of your site

### Revalidation

- `REVALIDATION_SECRET`: Secret key for revalidating pages
- `NEXT_PUBLIC_REVALIDATION_SECRET`: Same as above, but accessible from client-side
- `VERCEL_DEPLOYMENT_URL`: The URL of your Vercel deployment (e.g., https://dutchseedsupply.com)

### Authentication (if using Auth0)

- `AUTH0_SECRET`: Your Auth0 secret
- `AUTH0_BASE_URL`: Your Auth0 base URL
- `AUTH0_ISSUER_BASE_URL`: Your Auth0 issuer base URL
- `AUTH0_CLIENT_ID`: Your Auth0 client ID
- `AUTH0_CLIENT_SECRET`: Your Auth0 client secret

### PostgreSQL Configuration (if using direct connection)

If you're using a direct connection to PostgreSQL, you'll need these variables:

- `POSTGRES_HOST`: Your PostgreSQL host
- `POSTGRES_USER`: Your PostgreSQL username
- `POSTGRES_PASSWORD`: Your PostgreSQL password
- `POSTGRES_DATABASE`: Your PostgreSQL database name
- `POSTGRES_URL`: Your PostgreSQL connection URL
- `POSTGRES_URL_NON_POOLING`: Your PostgreSQL connection URL for non-pooling connections
- `POSTGRES_PRISMA_URL`: Your PostgreSQL connection URL for Prisma

## Setting Up Environment Variables in Vercel

1. Go to the [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Click on the "Settings" tab
4. In the left sidebar, click on "Environment Variables"
5. Add each of the required environment variables:
   - Enter the name of the variable (e.g., `NEXT_PUBLIC_SUPABASE_URL`)
   - Enter the value of the variable
   - Select the environments where the variable should be available (Production, Preview, Development)
   - Click "Add"
6. Repeat for all required environment variables
7. After adding all variables, redeploy your application

## Troubleshooting

If you encounter issues with the deployment, check the following:

1. Ensure all required environment variables are set correctly
2. Verify that the Supabase URL and keys are correct
3. Check the Vercel deployment logs for specific error messages
4. If you see errors related to missing environment variables, check if you're using the correct naming convention

## Notes on Security

- Never commit sensitive environment variables to your repository
- The `SUPABASE_SERVICE_ROLE_KEY` has admin privileges, so it should be kept secure
- Use different environment variables for development, preview, and production environments when possible
- Set `ADMIN_DEBUG_MODE` to 'false' or remove it in production environments

## Fallback Behavior

The application has been updated to handle missing environment variables gracefully:

- The application now supports both naming conventions for Supabase variables
- If Supabase credentials are missing during build, the application will skip database operations and use local configuration
- The Tailwind theme generator will use a default configuration if it cannot access the site configuration

This ensures that the build process will complete successfully even if some environment variables are missing, but for full functionality, all variables should be properly configured.
