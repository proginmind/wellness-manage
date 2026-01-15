# Deployment Guide - Vercel

This guide explains how to deploy the Wellness Manage application to Vercel.

## Prerequisites

1. **Vercel Account** - Sign up at [vercel.com](https://vercel.com)
2. **GitHub Repository** - Your code should be pushed to GitHub
3. **Supabase Project** - Set up for authentication
4. **Node.js 22+** - Specified in `.nvmrc`

## Quick Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/proginmind/wellness-manage)

## Step-by-Step Deployment

### 1. Connect GitHub Repository

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **"Add New Project"**
3. Import your GitHub repository: `proginmind/wellness-manage`
4. Click **"Import"**

### 2. Configure Project Settings

Vercel will auto-detect Next.js. Verify these settings:

- **Framework Preset:** Next.js
- **Root Directory:** `./` (default)
- **Build Command:** `pnpm build` (auto-detected)
- **Install Command:** `pnpm install` (auto-detected)
- **Output Directory:** `.next` (auto-detected)
- **Node.js Version:** 22.x

### 3. Add Environment Variables

Click on **"Environment Variables"** and add:

#### Required Variables

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

#### Optional Variables

```bash
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
NEXT_PUBLIC_API_URL=https://your-app.vercel.app/api
```

**Note:** You can add these to all environments (Production, Preview, Development) or specific ones.

### 4. Deploy

1. Click **"Deploy"**
2. Wait for build to complete (usually 2-3 minutes)
3. Your app will be live at `https://your-app.vercel.app`

## Post-Deployment Configuration

### 1. Update Supabase Settings

After deployment, update your Supabase project:

1. Go to Supabase Dashboard → **Authentication** → **URL Configuration**
2. Add your Vercel URL to **Site URL:**
   ```
   https://your-app.vercel.app
   ```
3. Add to **Redirect URLs:**
   ```
   https://your-app.vercel.app/**
   https://your-app.vercel.app/auth/callback
   ```

### 2. Configure Custom Domain (Optional)

1. In Vercel dashboard, go to **Settings** → **Domains**
2. Add your custom domain
3. Follow DNS configuration instructions
4. Update Supabase URLs to use custom domain

### 3. Update Environment Variables

If you added a custom domain or changed URLs:

1. Go to **Settings** → **Environment Variables**
2. Update `NEXT_PUBLIC_APP_URL` with your domain
3. Redeploy to apply changes

## Automatic Deployments

Vercel automatically deploys on:

- **Production:** Push to `main` branch
- **Preview:** Pull requests and other branches
- **Rollback:** Previous deployments remain accessible

### Branch Deployments

- `main` → Production (`your-app.vercel.app`)
- Other branches → Preview URLs (`branch-name-your-app.vercel.app`)

## Environment Variables Management

### Production vs Preview

```bash
# Production only
NEXT_PUBLIC_APP_URL=https://wellness-manage.com

# Preview only  
NEXT_PUBLIC_APP_URL=https://preview.wellness-manage.com

# All environments
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
```

### Updating Variables

1. Go to **Settings** → **Environment Variables**
2. Edit or add variables
3. Click **"Save"**
4. Redeploy for changes to take effect

## Build Configuration

### vercel.json

The project includes a `vercel.json` configuration:

```json
{
  "buildCommand": "pnpm build",
  "devCommand": "pnpm dev",
  "installCommand": "pnpm install",
  "framework": "nextjs",
  "regions": ["iad1"]
}
```

### Build Performance

- **Average build time:** 2-3 minutes
- **Cold start:** < 1 second
- **Edge deployment:** Global CDN

## Monitoring & Analytics

### Vercel Analytics

1. Go to **Analytics** tab in Vercel dashboard
2. Enable **Web Analytics**
3. View real-time traffic and performance

### Logs

1. Go to **Deployments** tab
2. Click on a deployment
3. View build and runtime logs

## Troubleshooting

### Build Failures

**Problem:** `pnpm: command not found`

**Solution:** Vercel auto-detects pnpm from `pnpm-lock.yaml`. Ensure the file is committed.

---

**Problem:** `Module not found` errors

**Solution:** 
1. Clear Vercel cache in deployment settings
2. Verify all dependencies in `package.json`
3. Redeploy

---

**Problem:** Environment variables not working

**Solution:**
1. Ensure variables start with `NEXT_PUBLIC_` for client-side access
2. Redeploy after adding/changing variables
3. Check variable names for typos

### Runtime Errors

**Problem:** `SUPABASE_URL is undefined`

**Solution:**
1. Verify environment variables are set in Vercel
2. Check they're added to correct environment (Production/Preview)
3. Ensure variable names match exactly
4. Redeploy

---

**Problem:** Authentication redirects fail

**Solution:**
1. Update Supabase redirect URLs with Vercel domain
2. Check `NEXT_PUBLIC_APP_URL` is set correctly
3. Verify Site URL in Supabase settings

### Performance Issues

**Problem:** Slow page loads

**Solution:**
1. Enable Vercel Edge Functions
2. Optimize images with Next.js Image component
3. Check database query performance
4. Enable ISR (Incremental Static Regeneration) for static pages

## Advanced Configuration

### Custom Headers

Add to `next.config.ts`:

```typescript
const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
    ];
  },
};
```

### Redirects

Add to `next.config.ts`:

```typescript
const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ];
  },
};
```

### Edge Functions

Convert API routes to Edge Functions by adding:

```typescript
export const runtime = 'edge';
```

## CI/CD Integration

### GitHub Actions (Optional)

Create `.github/workflows/vercel.yml`:

```yaml
name: Vercel Deploy
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

## Security Best Practices

### Environment Variables

✅ **DO:**
- Store secrets in Vercel environment variables
- Use `NEXT_PUBLIC_` prefix only for client-safe values
- Rotate API keys regularly

❌ **DON'T:**
- Commit `.env.local` to Git
- Expose sensitive keys with `NEXT_PUBLIC_` prefix
- Hardcode secrets in code

### Authentication

✅ **DO:**
- Use HTTPS only (automatic on Vercel)
- Set proper CORS headers
- Validate sessions on server-side

❌ **DON'T:**
- Store sensitive data in client state
- Trust client-side validation alone
- Skip middleware authentication checks

## Rollback

### Quick Rollback

1. Go to **Deployments** tab
2. Find previous successful deployment
3. Click **"⋯"** menu
4. Select **"Promote to Production"**

### Instant Rollback

Vercel keeps all previous deployments active. You can instantly switch back to any previous version.

## Cost Optimization

### Hobby Plan (Free)

- Unlimited personal projects
- Automatic HTTPS
- Global CDN
- Serverless functions
- Perfect for this project

### Pro Plan ($20/month)

Consider upgrading for:
- Team collaboration
- Advanced analytics
- Password protection
- Increased limits

## Support Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js on Vercel](https://vercel.com/docs/frameworks/nextjs)
- [Vercel Community](https://github.com/vercel/vercel/discussions)
- [Status Page](https://vercel-status.com)

## Checklist

Before deploying, ensure:

- [ ] Code pushed to GitHub
- [ ] Supabase project created
- [ ] Environment variables ready
- [ ] Build works locally (`pnpm build`)
- [ ] All tests pass (`pnpm lint`)
- [ ] `.env.local` not committed to Git
- [ ] `pnpm-lock.yaml` committed

After deploying:

- [ ] Verify app loads at Vercel URL
- [ ] Test authentication flow
- [ ] Update Supabase redirect URLs
- [ ] Configure custom domain (optional)
- [ ] Set up monitoring/analytics
- [ ] Test all features in production

## Need Help?

If you encounter issues:

1. Check [Vercel Documentation](https://vercel.com/docs)
2. Review [Build Logs](https://vercel.com/docs/deployments/logs)
3. Contact [Vercel Support](https://vercel.com/support)
4. Check this repo's issues on GitHub

---

**Your app is now deployed! 🚀**

Visit your live app at: `https://your-app.vercel.app`
