# Tasks Moving Forward - Clawban & Chatb2b

**Created:** 2026-01-26  
**Status:** Planning  
**Assignees:** Mix of James and Rufus

---

## Immediate Priority (Today/Tomorrow)

### 1. Complete PostgreSQL Migration [RUFUS]
**Status:** ⏸️ Waiting for Supabase maintenance  
**Assignee:** Rufus  
**Estimated:** 1.5 hours remaining

**Tasks:**
- [ ] Wait for Supabase maintenance to complete (~30 min)
- [ ] Run Prisma migrations against Supabase
- [ ] Refactor backend services to use Prisma ORM
- [ ] Delete old JSON file storage code
- [ ] Update all tests to use PostgreSQL
- [ ] Deploy to Railway
- [ ] Verify data persistence across restarts
- [ ] Run Opus 4.5 post-implementation audit

**Acceptance Criteria:**
- Tasks persist across Railway restarts
- All tests pass
- Query performance < 50ms
- Structured logging shows database queries
- Documentation updated

---

### 2. Deploy Frontend with Assignee UI [RUFUS]
**Status:** ✅ Code complete, deploying  
**Assignee:** Rufus  
**Estimated:** 5 minutes

**Tasks:**
- [ ] Verify Vercel deployment succeeded
- [ ] Test assignee dropdown works
- [ ] Test filter buttons work
- [ ] Verify assignee badges show correctly
- [ ] Create test tasks with different assignees

**Acceptance Criteria:**
- Can assign tasks to Rufus or James when creating
- Filter buttons correctly filter tasks
- Badges show with correct colors

---

## Short Term (This Week)

### 3. Daily Digest - Telegram Morning Summary [RUFUS]
**Status:** 📋 New  
**Assignee:** Rufus  
**Estimated:** 2 hours

**Description:**  
Send James a daily digest via Telegram each morning (6 AM HST) with:
- Tasks assigned to James (status breakdown)
- Tasks Rufus completed yesterday
- Tasks Rufus is working on today
- Any blockers or questions

**Tasks:**
- [ ] Create Telegram message formatter
- [ ] Add cron job for 8 AM HST daily
- [ ] Query tasks API for assignee data
- [ ] Format as readable markdown
- [ ] Test manually first, then automate
- [ ] Add ability to skip weekends (optional)

**Example Output:**
```
☀️ Good morning James!

📋 Your Tasks (3 total):
  • 2 new
  • 1 in-progress

🤖 Rufus Updates:
  ✅ Completed yesterday:
    - PostgreSQL migration
    - Frontend assignee UI
  
  🔨 Working on today:
    - Daily digest automation
    - Chatb2b-web updates

Need anything from you today?
```

---

### 4. Update chatb2b-web Repository [JAMES + RUFUS]
**Status:** 📋 New  
**Assignee:** James to scope, Rufus to execute  
**Estimated:** 4-6 hours

**What needs updating?**  
*(James to clarify specific requirements)*

**Possible areas:**
- [ ] Dependency updates (npm audit fix)
- [ ] TypeScript version bump
- [ ] Authentication flow improvements
- [ ] UI/UX enhancements
- [ ] API integration updates
- [ ] Performance optimizations
- [ ] Documentation updates

**Next Step:** James creates specific tasks in Clawban for chatb2b-web work

---

### 5. API Documentation with Swagger [RUFUS]
**Status:** 📋 Recommended from API audit  
**Assignee:** Rufus  
**Estimated:** 3 hours

**Tasks:**
- [ ] Install swagger-ui-express (already have it!)
- [ ] Create OpenAPI 3.0 spec from contracts
- [ ] Add Swagger UI at `/api-docs`
- [ ] Document all endpoints with examples
- [ ] Include authentication flows
- [ ] Add to DEPLOYMENT.md

**Value:** Makes it easy for both humans and AI agents to understand the API

---

### 6. Structured Logging Enhancement [RUFUS]
**Status:** ✅ Partially complete (Winston added)  
**Assignee:** Rufus  
**Estimated:** 1 hour

**Remaining:**
- [ ] Add database query logging
- [ ] Log LLM token usage
- [ ] Add performance timing logs
- [ ] Set up log aggregation (optional - Datadog/Logtail)
- [ ] Add error tracking (Sentry integration)

---

## Medium Term (Next 2 Weeks)

### 7. LLM Usage Tracking [RUFUS]
**Status:** 📋 New  
**Assignee:** Rufus  
**Estimated:** 3 hours

**Description:**  
When Rufus completes a task, automatically log token usage and costs to the database.

**Tasks:**
- [ ] Add LLM usage tracking API endpoint
- [ ] Track tokens_in, tokens_out, cost per task
- [ ] Display usage in task details
- [ ] Show aggregate costs in UI
- [ ] Monthly cost reports

**Schema already designed** in POSTGRES_MIGRATION_PLAN.md (llm_usage table)

---

### 8. Task Comments/Activity Log [JAMES + RUFUS]
**Status:** 📋 Future enhancement  
**Assignee:** TBD  
**Estimated:** 4 hours

**Features:**
- Comments on tasks
- Activity log (status changes, assignments, etc.)
- @mentions for notifications
- File attachments (optional)

---

### 9. Chatb2b Integration [RUFUS]
**Status:** 📋 Future  
**Assignee:** Rufus  
**Estimated:** 6 hours

**Ideas:**
- Create Clawban tasks from Chatb2b discovery findings
- "Investigate redundant SaaS tool X" → task in Clawban
- Link back to Chatb2b for context
- Sync status updates

---

### 10. Mobile-Friendly UI [JAMES + RUFUS]
**Status:** 📋 Future  
**Assignee:** TBD  
**Estimated:** 4 hours

**Tasks:**
- Optimize Kanban board for mobile
- Add swipe gestures for task movement
- Responsive filter buttons
- Mobile-optimized task cards

---

## Long Term (Next Month+)

### 11. Multi-User Support [RUFUS]
**Status:** 📋 Future  
**Assignee:** Rufus  
**Estimated:** 8 hours

**Features:**
- Invite other users (team members)
- Assign tasks to any user
- Role-based permissions
- User profiles
- Email notifications

**Database:** Already has Row-Level Security (RLS) setup for this!

---

### 12. Task Templates [RUFUS]
**Status:** 📋 Future  
**Assignee:** Rufus  
**Estimated:** 3 hours

**Examples:**
- "Bug Fix Template" → pre-filled model strategy, checklist
- "Feature Request Template"
- "Research Task Template"

---

### 13. GitHub Integration [RUFUS]
**Status:** 📋 Future  
**Assignee:** Rufus  
**Estimated:** 6 hours

**Features:**
- Create task from GitHub issue
- Link tasks to PRs
- Auto-update status when PR is merged
- Sync comments between GitHub and Clawban

---

### 14. Time Tracking [RUFUS]
**Status:** 📋 Future  
**Assignee:** Rufus  
**Estimated:** 4 hours

**Features:**
- Track time spent on tasks
- Estimate vs actual comparison
- Reports by assignee
- Burndown charts

---

## Maintenance & Operations

### 15. Monitoring & Alerting [RUFUS]
**Status:** 📋 Recommended  
**Assignee:** Rufus  
**Estimated:** 2 hours

**Tasks:**
- [ ] Set up UptimeRobot for health check monitoring
- [ ] Railway metrics dashboard
- [ ] Supabase database size alerts
- [ ] Error rate monitoring
- [ ] Slack/Telegram alerts for downtime

---

### 16. Backup Strategy [RUFUS]
**Status:** 📋 Recommended  
**Assignee:** Rufus  
**Estimated:** 1 hour

**Tasks:**
- [ ] Document Supabase backup schedule (daily auto-backups)
- [ ] Test restore procedure
- [ ] Weekly manual backup to S3 (optional)
- [ ] Add backup verification to DEPLOYMENT_CHECKLIST

---

### 17. Security Audit [JAMES + RUFUS]
**Status:** 📋 Before scaling  
**Assignee:** Both  
**Estimated:** 4 hours

**Areas:**
- API key rotation policy
- Supabase RLS policy review
- Rate limiting effectiveness
- Input sanitization audit
- CSRF protection (if adding forms)
- Penetration testing (optional - hire external)

---

## Documentation Tasks

### 18. User Guide [RUFUS]
**Status:** 📋 New  
**Assignee:** Rufus  
**Estimated:** 2 hours

**Content:**
- How to create tasks
- How to assign tasks
- How to filter and search
- How Rufus uses the system
- Best practices for task writing

---

### 19. API Integration Guide [RUFUS]
**Status:** 📋 New  
**Assignee:** Rufus  
**Estimated:** 2 hours

**For AI agents wanting to integrate:**
- Authentication (API key setup)
- Endpoint documentation
- Code examples (Python, Node.js, curl)
- Rate limits and best practices
- Webhook setup (future)

---

## Task Creation Workflow

**For James:**
1. Create tasks in Clawban UI
2. Assign to Rufus or yourself
3. Rufus gets notified via API polling (or webhook later)
4. Track progress on the board

**For Rufus:**
1. Check `/api/tasks?assignee=rufus` periodically
2. Pick up new tasks
3. Update status as I work
4. Add LLM usage when complete
5. Comment with findings/questions

---

## Priority Matrix

| Task | Priority | Effort | Assignee | Blocked By |
|------|----------|--------|----------|------------|
| PostgreSQL Migration | P0 🔴 | 1.5h | Rufus | Supabase maintenance |
| Deploy Frontend | P0 🔴 | 5min | Rufus | None |
| Daily Digest | P1 🟠 | 2h | Rufus | None |
| Chatb2b-web Updates | P1 🟠 | 4-6h | James+Rufus | Scoping needed |
| API Documentation | P2 🟡 | 3h | Rufus | None |
| LLM Usage Tracking | P2 🟡 | 3h | Rufus | PostgreSQL migration |
| Monitoring Setup | P2 🟡 | 2h | Rufus | PostgreSQL migration |

---

## Next Actions

**Immediate (today):**
1. ✅ Frontend assignee UI deployed
2. ⏸️ Wait for Supabase maintenance (~30 min)
3. 🔨 Complete PostgreSQL migration
4. 🔨 Deploy backend to Railway
5. ✅ Test end-to-end workflow

**Tomorrow:**
1. Daily digest Telegram automation
2. Scope chatb2b-web updates with James
3. API documentation (Swagger)

---

## How to Use This Document

**James:**
- Review this list
- Adjust priorities as needed
- Add specific requirements for chatb2b-web
- Create tasks in Clawban for items you want tracked

**Rufus:**
- Pick up tasks assigned to me
- Update status in Clawban
- Document progress
- Ask questions when blocked

**Together:**
- Weekly review of this list
- Adjust based on what's working
- Add new tasks as needed
- Celebrate completions! 🎉

---

**Status Legend:**
- 📋 New - Not started
- 🔨 In Progress - Currently working
- ⏸️ Blocked - Waiting on something
- ✅ Complete - Done!
- 🔴 P0 - Critical/Urgent
- 🟠 P1 - High priority
- 🟡 P2 - Medium priority
- 🟢 P3 - Low priority / Nice to have
