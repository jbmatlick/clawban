# Deployment Guide - Clawban

## Architecture Overview

**Monorepo structure:**
- `backend/` - Express API (TypeScript)
- `frontend/` - React SPA (TypeScript + Vite)
- `contracts/` - Shared TypeScript types (used by both)

**Technology Stack:**
- Runtime: Node.js 20+ (required by Supabase SDK)
- Backend: Express + TypeScript
- Frontend: React + Vite
- Auth: Supabase
- Deployment: Railway (Docker)

---

## Prerequisites Checklist

### Environment Variables Required

**Backend (Railway):**
- ✅ `SUPABASE_URL` - Supabase project URL
- ✅ `SUPABASE_ANON_KEY` - Supabase anonymous key
- ✅ `SUPABASE_SERVICE_KEY` - Supabase service role key
- ✅ `ALLOWED_ORIGINS` - CORS allowed origins (comma-separated)
- ⚠️ `PORT` - Auto-set by Railway (do not override)

**Frontend (Vercel/Netlify):**
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key
- `VITE_API_URL` - Backend API URL (Railway domain)

### Supabase Setup

1. **Create Supabase project** at https://supabase.com
2. **Get credentials** from Project Settings → API
3. **Create users manually** (no public signup):
   - Go to Authentication → Users
   - Click "Add User" or "Invite User"
   - Enter email + password

---

## Deployment Steps

### 1. Backend Deployment (Railway)

**One-time setup:**
```bash
cd clawban
railway login
railway init
railway service  # Link to service
railway domain   # Generate public URL
```

**Set environment variables:**
```bash
railway variables set \
  SUPABASE_URL="https://xxxxx.supabase.co" \
  SUPABASE_ANON_KEY="your_anon_key" \
  SUPABASE_SERVICE_KEY="your_service_key" \
  ALLOWED_ORIGINS="https://your-frontend-domain.com"
```

**Deploy:**
```bash
railway up
```

**Verify deployment:**
```bash
curl https://your-app.railway.app/health
# Should return: {"status":"ok","timestamp":"..."}
```

### 2. Frontend Deployment (TBD)

*(Will be added when frontend deployment is configured)*

---

## Dockerfile Best Practices

Our Dockerfile follows production best practices:

1. **Multi-stage build** - Separate build and runtime stages
2. **Minimal base image** - Alpine Linux for small footprint
3. **Layer caching** - Copy dependencies first, then source
4. **Production dependencies only** - `npm ci --only=production`
5. **Non-root user** - Security best practice (TODO)
6. **Health checks** - Expose `/health` endpoint
7. **Explicit Node version** - Node 20 for Supabase compatibility

---

## Troubleshooting

### Build fails with "Cannot find module contracts/types.js"
- **Cause:** Dockerfile doesn't copy `contracts/` directory
- **Fix:** Add `COPY contracts/ ./contracts/` to Dockerfile

### Build fails with "Unsupported engine Node 18"
- **Cause:** Supabase SDK requires Node 20+
- **Fix:** Update Dockerfile to use `node:20-alpine`

### App returns 502 on Railway
- **Cause:** App crashes at startup
- **Check:** Railway logs for error messages
- **Common causes:**
  - Missing environment variables
  - Port binding issues (must use `process.env.PORT`)
  - Uncaught exceptions at startup

### CORS errors in frontend
- **Cause:** Backend not configured for frontend origin
- **Fix:** Add frontend URL to `ALLOWED_ORIGINS` env var

---

## Security Checklist

- ✅ Helmet security headers enabled
- ✅ Rate limiting (100 req/15min)
- ✅ Request size limits (1MB)
- ✅ JWT authentication on all `/api/*` routes
- ✅ Environment variables for secrets (not in code)
- ⚠️ HTTPS only (enforced by Railway)
- ⚠️ Non-root user in Docker (TODO)
- ⚠️ SOC 2 compliance planning (future)

---

## Monitoring & Health

**Health check endpoint:**
```bash
GET /health
Response: {"status":"ok","timestamp":"2026-01-26T..."}
```

**Logging:**
- All requests logged: `TIMESTAMP METHOD PATH`
- Errors logged to stderr
- Railway captures all console output

**Future improvements:**
- [ ] Structured logging (JSON)
- [ ] Error tracking (Sentry)
- [ ] Uptime monitoring (UptimeRobot)
- [ ] Performance monitoring (Datadog/New Relic)

---

## Rollback Procedure

If a deployment fails:

```bash
# Via Railway CLI
railway rollback

# Or via Railway Dashboard
# → Deployments → Select previous deployment → Redeploy
```

---

## Deployment Checklist

Before each deployment:

- [ ] All tests pass locally (`npm test`)
- [ ] Lint passes (`npm run lint`)
- [ ] TypeScript compiles (`npm run build`)
- [ ] Environment variables verified in Railway
- [ ] Health check endpoint accessible
- [ ] Authentication working (test login)

---

## Contact

For deployment issues:
- Railway Dashboard: https://railway.com/project/4b23912d-f041-4508-b856-d69127bf5e22
- Supabase Dashboard: https://supabase.com/dashboard
