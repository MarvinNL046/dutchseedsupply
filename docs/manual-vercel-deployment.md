# Manual Vercel Deployment Instructions

Since we've made changes to fix the admin authentication issues, you'll need to deploy these changes to Vercel. Here are the steps to deploy manually through the Vercel dashboard:

## Option 1: Deploy from Vercel Dashboard

1. Go to the Vercel Dashboard: https://vercel.com/dashboard
2. Select your project: `dutchseedsupply`
3. Click on the "Deployments" tab
4. Click on the "Deploy" button
5. Select the "Production" environment
6. Click "Deploy"

## Option 2: Trigger a Deployment from GitHub

Since we've already pushed the changes to GitHub, Vercel should automatically detect these changes and start a new deployment. If it doesn't, you can:

1. Go to your GitHub repository: https://github.com/MarvinNL046/dutchseedsupply
2. Make a small change to any file (e.g., add a comment to README.md)
3. Commit and push the change
4. This will trigger a new deployment on Vercel

## What Changes Were Made

1. **Restored Normal Authentication**:
   - Disabled DEBUG_MODE in `utils/supabase/server.ts`
   - This ensures that only authenticated admin users can access the admin pages

2. **Applied Fixed Middleware**:
   - Applied the fixed middleware that prevents infinite redirect loops
   - The middleware now checks if the request is coming from the login page to prevent loops

3. **Applied Admin Policies**:
   - Confirmed that your email (marvinsmit1988@gmail.com) is set as an admin in the database
   - Applied admin policies to ensure proper access to admin resources

## After Deployment

After deploying, you should be able to:

1. Log in with your admin account
2. Access the admin pages without infinite redirect loops
3. See all the data in the admin dashboard

If you encounter any issues after deployment, you can use the debugging tools we've created:

- `node scripts/enable-debug-mode-in-production.js` to temporarily enable DEBUG_MODE
- `node scripts/apply-debug-admin-middleware.js` to temporarily allow access to admin pages without authentication

Remember to disable these debug modes after troubleshooting by running:
- `node scripts/restore-server-file.js`
- `node scripts/restore-original-middleware.js`
