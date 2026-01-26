# Vercel Frontend Deployment

## Prerequisites

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

## Deploy Frontend

### One-time setup:

```bash
cd clawban/frontend
vercel
```

Follow the prompts:
- **Set up and deploy?** Y
- **Which scope?** (select your account)
- **Link to existing project?** N
- **Project name:** clawban-frontend (or whatever you want)
- **Directory?** ./ (current directory)
- **Override settings?** N

### Set Environment Variables:

```bash
vercel env add VITE_SUPABASE_URL production
# Paste: https://ljjqlehrxxxgdcsfvzei.supabase.co

vercel env add VITE_SUPABASE_ANON_KEY production
# Paste: sb_publishable_rkuWDIpYgdDUm9VmzbsY3w_iKUA-IWm

vercel env add VITE_API_URL production
# Paste: https://clawban-production.up.railway.app
```

### Deploy:

```bash
# Deploy to production
vercel --prod
```

### Update Railway CORS:

Once you have the Vercel URL (e.g., `https://clawban-frontend.vercel.app`), update Railway:

```bash
cd ../  # back to clawban root
railway variables set ALLOWED_ORIGINS="https://clawban-frontend.vercel.app"
```

## Continuous Deployment

Vercel auto-deploys on every push to `main` branch once connected to GitHub:

1. Go to https://vercel.com/dashboard
2. Select your project
3. Settings → Git
4. Connect to GitHub repository
5. **Root Directory:** `frontend`
6. Auto-deploy enabled ✅

## Quick Commands

```bash
# Production deploy
vercel --prod

# Preview deploy (test branch)
vercel

# View logs
vercel logs

# Open dashboard
vercel --open
```

## Troubleshooting

### Build fails with "Cannot find module"
- Check that all frontend dependencies are in `frontend/package.json`
- Run `npm install` locally first

### API calls fail with CORS error
- Verify `ALLOWED_ORIGINS` in Railway includes Vercel URL
- Check browser console for exact origin being blocked

### Environment variables not working
- Vite requires `VITE_` prefix for client-side vars
- Redeploy after adding env vars: `vercel --prod`
