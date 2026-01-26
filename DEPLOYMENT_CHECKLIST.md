# Deployment Checklist

## Pre-Deployment

- [ ] **Code Quality**
  - [ ] All tests pass: `cd backend && npm test`
  - [ ] Lint passes: `cd backend && npm run lint`
  - [ ] TypeScript compiles: `cd backend && npm run build`
  - [ ] No console errors in local dev

- [ ] **Environment Variables Set in Railway**
  - [ ] `SUPABASE_URL`
  - [ ] `SUPABASE_ANON_KEY`
  - [ ] `SUPABASE_SERVICE_KEY`
  - [ ] `ALLOWED_ORIGINS` (with frontend URL)
  - [ ] `PORT` is NOT set (Railway auto-assigns)

- [ ] **Supabase Configuration**
  - [ ] Project created
  - [ ] Test user created (Authentication → Users)
  - [ ] API credentials copied to Railway

- [ ] **Documentation**
  - [ ] README.md updated with new features
  - [ ] DEPLOYMENT.md reflects current setup
  - [ ] API endpoints documented

## During Deployment

- [ ] **Build Verification**
  - [ ] Docker build succeeds
  - [ ] No missing dependencies errors
  - [ ] No TypeScript compilation errors
  - [ ] Build logs show clean completion

- [ ] **Deploy Command**
  ```bash
  cd clawban
  git status  # Verify all changes committed
  railway up  # Deploy to Railway
  ```

## Post-Deployment

- [ ] **Health Check**
  ```bash
  curl https://clawban-production.up.railway.app/health
  # Expected: {"status":"ok","timestamp":"..."}
  ```

- [ ] **API Endpoints**
  ```bash
  # Should return 401 (auth required)
  curl https://clawban-production.up.railway.app/api/tasks
  ```

- [ ] **Railway Dashboard**
  - [ ] Deployment shows "Active"
  - [ ] No crash loops in logs
  - [ ] Memory/CPU usage normal

- [ ] **Authentication Flow**
  - [ ] Login with test user works
  - [ ] Invalid credentials rejected
  - [ ] JWT token generation works

- [ ] **Frontend Integration** (when ready)
  - [ ] Frontend can reach backend
  - [ ] CORS configured correctly
  - [ ] Login flow end-to-end works

## Rollback Plan

If deployment fails:

1. **Check Railway logs:**
   ```bash
   railway logs --tail 100
   ```

2. **Rollback if needed:**
   ```bash
   railway rollback
   ```

3. **Or via Dashboard:**
   - Railway → Deployments → Previous deployment → Redeploy

## Common Issues

| Issue | Solution |
|-------|----------|
| 502 Bad Gateway | App crashed at startup - check logs |
| Cannot find module | Missing COPY in Dockerfile |
| EBADENGINE Node version | Update to Node 20+ |
| CORS error | Add frontend URL to ALLOWED_ORIGINS |
| 401 Unauthorized | Check Supabase credentials in Railway |

## Success Criteria

- ✅ Health endpoint returns 200
- ✅ API returns 401 for protected routes (auth working)
- ✅ No errors in Railway logs
- ✅ Build time < 3 minutes
- ✅ App starts within 30 seconds
