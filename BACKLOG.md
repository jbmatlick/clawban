# Clawban Backlog

**Tag:** `clawban`

All tasks should be added to Clawban itself with the "clawban" tag once the tag filtering feature is working.

---

## P0 - Critical (Do First)

### 1. Complete PostgreSQL Migration
**Effort:** 1.5 hours  
**Payoff:** HIGH - Data persistence, no more lost tasks  
**Assignee:** Rufus

**Why:** Still using JSON files, data lost on Railway restarts

**Tasks:**
1. Wait for Supabase maintenance to complete
2. Run `npx prisma migrate deploy`
3. Refactor services to use Prisma ORM
4. Delete old JSON file storage code
5. Update tests for Prisma
6. Deploy to Railway
7. Verify persistence across restarts

**Blocked by:** Supabase maintenance

---

### 2. Set up GitHub Actions CI/CD
**Effort:** 10 minutes  
**Payoff:** HIGH - Automated testing, no broken deploys  
**Assignee:** James

**Why:** Tests exist but don't run automatically. Need to catch issues before production.

**Tasks:**
1. Add GitHub secrets:
   - `RAILWAY_TOKEN` - Get from: `railway login; railway whoami`
   - `RAILWAY_URL` - Railway app URL
   - `VERCEL_TOKEN` - vercel.com → Settings → Tokens
   - `VERCEL_ORG_ID` - From Vercel project
   - `VERCEL_PROJECT_ID` - `prj_SoEscRX6maMAXEkFHvMCNisw2KMD`
   - `VERCEL_URL` - Vercel app URL
   - `TELEGRAM_BOT_TOKEN` (optional)
   - `TELEGRAM_CHAT_ID` (optional)
2. Push to main → workflow runs automatically
3. Verify test failures block deployment

**File:** `.github/workflows/test-and-deploy.yml` (already created)

---

## P1 - High Priority Quick Wins

### 3. Add tag filtering to frontend UI ⚡
**Effort:** 30 minutes  
**Payoff:** HIGH - Essential for organizing tasks by project  
**Assignee:** Rufus

**Why:** Can't filter tasks by project/category. Need this to use Clawban for Clawban backlog!

**Tasks:**
1. Add tag filter buttons to Kanban UI (like assignee filters)
2. Update API client to pass `?tag=clawban` param
3. Backend already supports it (`GET /api/tasks?tag=<name>`)
4. Style like existing assignee filter buttons
5. Show active tag highlight
6. Test with "clawban" tag

**Acceptance:** Click "clawban" tag → only clawban tasks show

---

### 4. Add pre-commit hooks with Husky ⚡
**Effort:** 20 minutes  
**Payoff:** HIGH - Catch issues before commit  
**Assignee:** Rufus

**Why:** Tests exist but aren't enforced locally

**Tasks:**
1. `npm install --save-dev husky lint-staged`
2. `npx husky init`
3. Add pre-commit hook: `npm run precommit`
4. Configure lint-staged for TS/JSON files
5. Test: Try to commit broken code → blocked

**Acceptance:** Can't commit code that fails lint/typecheck/tests

---

### 5. Deploy frontend to Vercel ⚡
**Effort:** 30 minutes  
**Payoff:** MEDIUM - Public access to Clawban  
**Assignee:** Rufus

**Why:** Frontend isn't deployed anywhere

**Tasks:**
1. Create production `.env`:
   ```
   VITE_API_URL=https://your-app.railway.app
   VITE_SUPABASE_URL=https://ljjqlehrxxxgdcsfvzei.supabase.co
   VITE_SUPABASE_ANON_KEY=<anon-key>
   ```
2. `cd frontend && vercel --prod`
3. Test authentication works
4. Update DEPLOYMENT.md
5. Add URL to README

**Acceptance:** Can access Clawban UI at public URL

---

### 6. Add OpenAPI/Swagger docs
**Effort:** 2 hours  
**Payoff:** MEDIUM - Better API documentation  
**Assignee:** Rufus

**Why:** No interactive API documentation

**Tasks:**
1. Generate OpenAPI spec from contracts
2. Add swagger-ui-express (already installed)
3. Mount at `/api-docs`
4. Add examples for each endpoint
5. Include authentication flows (JWT + API key)

**Acceptance:** Visit `/api-docs` → see interactive API docs

---

## P2 - Medium Priority

### 7. Add Prometheus metrics endpoint
**Effort:** 2 hours  
**Payoff:** MEDIUM - Observability  
**Assignee:** Rufus

**Why:** No metrics for system performance

**Tasks:**
1. `npm install prom-client`
2. Create metrics:
   - `http_request_duration_seconds`
   - `task_count_by_status`
   - `task_count_by_assignee`
3. Add `GET /metrics` endpoint
4. Instrument request middleware
5. Document in DEPLOYMENT.md

**Acceptance:** Prometheus can scrape `/metrics`

---

### 8. Add LLM usage tracking API
**Effort:** 3 hours  
**Payoff:** HIGH - Track actual costs  
**Assignee:** Rufus

**Why:** No way to log actual token usage when completing tasks

**Tasks:**
1. Add `POST /api/tasks/:id/llm-usage` endpoint
2. Accept: `{ model, tokens_in, tokens_out, cost }`
3. Store in database (schema already designed in Prisma)
4. Display in task details UI
5. Add aggregate cost dashboard
6. Integrate with Rufus's workflow

**Acceptance:** Rufus can log token usage after completing tasks

---

### 9. Add Clawban self-management integration
**Effort:** 2 hours  
**Payoff:** HIGH - Dogfooding Clawban  
**Assignee:** Rufus

**Why:** Use Clawban to manage Clawban development

**Tasks:**
1. Create "clawban" project tag
2. Migrate this backlog to actual tasks
3. Set up Rufus to check `/api/tasks?tag=clawban&assignee=rufus`
4. Rufus updates task status as work progresses
5. James reviews completed tasks

**Acceptance:** All Clawban work tracked in Clawban

---

### 10. Add task search
**Effort:** 3 hours  
**Payoff:** MEDIUM - Find tasks faster  
**Assignee:** Rufus

**Why:** Hard to find specific tasks

**Tasks:**
1. Add search input to Kanban UI
2. Backend: Full-text search on title + description
3. Debounce search input (300ms)
4. Highlight matching text
5. Combine with existing filters (AND logic)

**Acceptance:** Can search for keywords and find tasks

---

## P3 - Nice to Have

### 11. Add E2E tests with Playwright
**Effort:** 4 hours  
**Payoff:** MEDIUM - Catch UI bugs  
**Assignee:** Rufus

**Why:** Integration tests don't cover full user flows

**Tasks:**
1. `npm install -D @playwright/test`
2. Create `tests/e2e/` folder
3. Test flow: Login → Create task → Move to complete → Delete
4. Add to CI/CD pipeline
5. Run on every deployment

**Acceptance:** E2E tests catch UI bugs before production

---

### 12. Add daily digest Telegram bot
**Effort:** 2 hours  
**Payoff:** LOW - Nice automation  
**Assignee:** Rufus

**Why:** James wants task summary each morning

**Tasks:**
1. Create cron job for 6 AM HST daily
2. Query API for task counts by assignee + status
3. Format as markdown message:
   ```
   ☀️ Good morning James!
   
   📋 Your Tasks:
     • 2 new
     • 1 in-progress
   
   🤖 Rufus Updates:
     ✅ Completed: PostgreSQL migration
     🔨 Working on: Tag filtering
   ```
4. Send via Telegram
5. Add "skip weekends" option

**Acceptance:** James gets daily digest at 6 AM HST

---

### 13. Add task comments/activity log
**Effort:** 4 hours  
**Payoff:** MEDIUM - Better collaboration  
**Assignee:** Rufus

**Why:** No way to discuss tasks or see history

**Tasks:**
1. Add `comments` table to Prisma schema
2. `POST /api/tasks/:id/comments`
3. `GET /api/tasks/:id/comments`
4. Add comment UI to task modal
5. Track status changes automatically ("moved to in-progress")
6. Add @mentions (future)

**Acceptance:** Can comment on tasks, see activity history

---

### 14. Add advanced filtering
**Effort:** 3 hours  
**Payoff:** LOW - Power users  
**Assignee:** Rufus

**Why:** Need complex queries

**Tasks:**
1. Date range picker (created, completed)
2. Cost range filter
3. Model strategy filter
4. Multiple tags (AND/OR logic)
5. Save filter presets
6. URL parameters for sharing filtered views

**Acceptance:** Can create complex filters and save them

---

### 15. Write user guide
**Effort:** 2 hours  
**Payoff:** LOW - Documentation  
**Assignee:** Rufus

**Why:** No documentation for how to use Clawban

**Tasks:**
1. Create `USER_GUIDE.md`
2. How to create tasks
3. How to assign and filter
4. Best practices for task writing
5. Integration with AI agents
6. Screenshots/GIFs

**Acceptance:** New user can onboard from guide alone

---

## Quick Wins Summary (Do These First)

| Task | Effort | Payoff | Priority |
|------|--------|--------|----------|
| PostgreSQL migration | 1.5h | HIGH | P0 |
| GitHub Actions setup | 10m | HIGH | P0 |
| Tag filtering UI | 30m | HIGH | P1 ⚡ |
| Pre-commit hooks | 20m | HIGH | P1 ⚡ |
| Deploy frontend | 30m | MEDIUM | P1 ⚡ |

**Total quick wins:** ~3 hours for massive improvement

---

## How to Use This Backlog

1. **James:** Review priorities, adjust as needed
2. **Rufus:** Pick up P0/P1 tasks
3. **Once tag filtering works:** Migrate this to actual Clawban tasks
4. **Update status:** Move tasks through columns as work progresses
5. **Weekly review:** Adjust priorities based on what's working

---

**Status Legend:**
- P0: Critical/blocking
- P1: High priority
- P2: Medium priority
- P3: Nice to have
- ⚡: Quick win (< 1 hour, high payoff)
