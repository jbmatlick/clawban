# Frontend Deployment - Tested Commands

## Prerequisites Check

```bash
# Verify you're in the right place
pwd
# Should show: /Users/clawdmatlick/clawd

# Check frontend exists
ls clawban/frontend
# Should show: package.json, src/, dist/, etc.
```

## Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

**Verify installation:**
```bash
vercel --version
# Should show: Vercel CLI 37.x.x or similar
```

## Step 2: Navigate to Frontend

```bash
cd clawban/frontend
```

## Step 3: Test Build Locally

```bash
npm run build
```

**Expected output:**
```
✓ 1752 modules transformed.
✓ built in ~1.35s
```

## Step 4: Login to Vercel

```bash
vercel login
```

Choose your login method (GitHub, GitLab, Email, etc.)

## Step 5: Deploy

```bash
vercel
```

**Follow the prompts:**
- Set up and deploy? **Y**
- Which scope? (Select your account)
- Link to existing project? **N**
- Project name: `clawban` (or whatever you want)
- In which directory is your code located? **./  (just press Enter)**
- Want to override settings? **N**

**It will:**
1. Build your app
2. Deploy to a preview URL
3. Give you a URL like: `https://clawban-xyz123.vercel.app`

## Step 6: Set Production Environment Variables

```bash
vercel env add VITE_API_URL production
# Enter: https://clawban-production.up.railway.app

vercel env add VITE_SUPABASE_URL production  
# Enter: https://ljjqlehrxxxgdcsfvzei.supabase.co

vercel env add VITE_SUPABASE_ANON_KEY production
# Enter: sb_publishable_rkuWDIpYgdDUm9VmzbsY3w_iKUA-IWm
```

## Step 7: Deploy to Production

```bash
vercel --prod
```

This creates the production deployment with environment variables.

## Step 8: Update Backend CORS

Once you have your production URL (e.g., `https://clawban.vercel.app`):

```bash
cd ..  # back to clawban root
railway variables set ALLOWED_ORIGINS="https://clawban.vercel.app"
```

## Verify Deployment

1. **Open your Vercel URL** in a browser
2. **Try to login** - it should connect to:
   - Supabase for auth
   - Railway backend for API calls

## Troubleshooting

### "vercel: command not found"
```bash
npm install -g vercel
# Then restart terminal or run: source ~/.zshrc
```

### Build fails
```bash
# Check locally first
npm run build
# Fix any errors shown
```

### CORS errors in browser console
```bash
# Update Railway CORS to include your Vercel domain
railway variables set ALLOWED_ORIGINS="https://your-app.vercel.app"
```

### Environment variables not working
```bash
# In Vercel dashboard:
# Project → Settings → Environment Variables
# Add VITE_API_URL, VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
# Then redeploy: vercel --prod
```

## Continuous Deployment (Optional)

Connect to GitHub for auto-deploy on push:

1. Go to https://vercel.com/dashboard
2. Import your GitHub repository
3. Set **Root Directory** to `frontend`
4. Add environment variables
5. Deploy

Now every push to `main` auto-deploys!

---

## Quick Reference

```bash
# From ~/clawd:
cd clawban/frontend
npm run build          # Test build locally
vercel                 # Deploy preview
vercel --prod          # Deploy to production
vercel logs            # View logs
vercel --open          # Open dashboard
```
