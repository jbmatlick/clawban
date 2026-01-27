# PostgreSQL Migration Plan - Clawban
## CTO-Level Enterprise Architecture

**Author:** Rufus (AI Assistant) using Claude Opus 4.5  
**Date:** 2026-01-26  
**Status:** Planning Phase  
**Risk Level:** Medium (data migration, breaking changes)

---

## Executive Summary

**Current State:**
- JSON file-based storage (`backend/data/tasks.json`)
- Data lost on Railway container restarts
- File locks don't scale across multiple instances
- No audit trail or versioning

**Target State:**
- Supabase PostgreSQL database
- Persistent, ACID-compliant storage
- Row-level security (RLS) for multi-user support
- Proper indexes and constraints
- Audit logging built-in

**Migration Strategy:** Blue-green deployment with rollback capability

**Timeline:** ~2 hours implementation + 30 min testing

---

## Architecture Decision

### Why Supabase PostgreSQL?

1. **Already integrated** - Using Supabase for authentication
2. **Unified data platform** - Users and tasks in same database
3. **Built-in features:**
   - Row-level security (RLS)
   - Real-time subscriptions (future feature)
   - REST API auto-generation (if needed)
   - Dashboard GUI for data inspection
4. **Cost-effective** - Free tier supports up to 500MB database
5. **Managed backups** - Point-in-time recovery included

### Alternatives Considered

| Option | Pros | Cons | Decision |
|--------|------|------|----------|
| **Railway PostgreSQL** | Same platform as API | Additional cost, no GUI | ❌ Rejected |
| **MongoDB** | Flexible schema | Overkill for structured data | ❌ Rejected |
| **SQLite** | Lightweight | File-based (same problem) | ❌ Rejected |
| **Supabase PostgreSQL** | Already integrated | None | ✅ **Selected** |

---

## Database Schema Design

### Tasks Table

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create tasks table
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  model_strategy VARCHAR(50) NOT NULL CHECK (
    model_strategy IN ('opus-planning', 'opus-coding', 'sonnet-coding', 'mixed')
  ),
  estimated_token_cost INTEGER DEFAULT 0 CHECK (estimated_token_cost >= 0),
  estimated_dollar_cost DECIMAL(10, 2) DEFAULT 0.00 CHECK (estimated_dollar_cost >= 0),
  status VARCHAR(20) NOT NULL DEFAULT 'new' CHECK (
    status IN ('new', 'approved', 'in-progress', 'complete')
  ),
  assignee VARCHAR(20) CHECK (assignee IN ('rufus', 'james') OR assignee IS NULL),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES auth.users(id),
  
  -- Constraints
  CONSTRAINT completed_at_requires_complete_status 
    CHECK (
      (status = 'complete' AND completed_at IS NOT NULL) OR 
      (status != 'complete' AND completed_at IS NULL)
    )
);

-- Create indexes for common queries
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_assignee ON tasks(assignee) WHERE assignee IS NOT NULL;
CREATE INDEX idx_tasks_created_at ON tasks(created_at DESC);
CREATE INDEX idx_tasks_created_by ON tasks(created_by);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_tasks_updated_at 
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments for documentation
COMMENT ON TABLE tasks IS 'Task management for AI agents and human users';
COMMENT ON COLUMN tasks.assignee IS 'Who is responsible: rufus (AI), james (human), or NULL (unassigned)';
COMMENT ON COLUMN tasks.model_strategy IS 'LLM strategy for execution: opus-planning, opus-coding, sonnet-coding, or mixed';
```

### LLM Usage Tracking Table

```sql
-- Create llm_usage table for cost tracking
CREATE TABLE llm_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  model VARCHAR(100) NOT NULL,
  tokens_in INTEGER NOT NULL CHECK (tokens_in >= 0),
  tokens_out INTEGER NOT NULL CHECK (tokens_out >= 0),
  cost DECIMAL(10, 6) NOT NULL CHECK (cost >= 0),
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  -- Index for aggregation queries
  CONSTRAINT fk_task FOREIGN KEY (task_id) REFERENCES tasks(id)
);

CREATE INDEX idx_llm_usage_task_id ON llm_usage(task_id);
CREATE INDEX idx_llm_usage_timestamp ON llm_usage(timestamp DESC);

COMMENT ON TABLE llm_usage IS 'LLM token usage and cost tracking per task execution';
```

### Row-Level Security (RLS)

```sql
-- Enable RLS
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE llm_usage ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone authenticated can read all tasks
CREATE POLICY "Tasks are viewable by authenticated users"
  ON tasks FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Authenticated users can create tasks
CREATE POLICY "Authenticated users can create tasks"
  ON tasks FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy: Users can update any task (for now)
CREATE POLICY "Authenticated users can update tasks"
  ON tasks FOR UPDATE
  TO authenticated
  USING (true);

-- Policy: Users can delete any task (for now)
CREATE POLICY "Authenticated users can delete tasks"
  ON tasks FOR DELETE
  TO authenticated
  USING (true);

-- LLM usage policies (read-only for most, write for API)
CREATE POLICY "LLM usage viewable by authenticated users"
  ON llm_usage FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "LLM usage insertable by service role"
  ON llm_usage FOR INSERT
  TO service_role
  WITH CHECK (true);
```

**Note:** RLS policies are permissive for MVP. Tighten later based on multi-user requirements.

---

## ORM Selection: Prisma

### Why Prisma?

- ✅ Type-safe database access (generated TypeScript types)
- ✅ Excellent migrations system
- ✅ Works with existing Supabase setup
- ✅ Built-in connection pooling
- ✅ Strong community and docs

### Alternative: Drizzle ORM

- ✅ Lighter weight
- ✅ SQL-like syntax
- ❌ Less mature ecosystem
- ❌ Migration tooling not as robust

**Decision:** Prisma for enterprise-grade stability and tooling.

---

## Migration Strategy: Blue-Green Deployment

### Phase 1: Preparation (No Downtime)

1. **Install Prisma:**
   ```bash
   cd backend
   npm install prisma @prisma/client
   npm install -D prisma
   ```

2. **Initialize Prisma:**
   ```bash
   npx prisma init
   ```

3. **Configure** `prisma/schema.prisma` with Supabase connection
4. **Create migration** files
5. **Test locally** against Supabase dev database

### Phase 2: Database Setup (No Downtime)

1. Run migrations against Supabase:
   ```bash
   npx prisma migrate deploy
   ```

2. Verify schema in Supabase dashboard
3. Seed with test data

### Phase 3: Dual-Write Implementation (No Downtime)

**Strategy:** Write to both JSON file AND PostgreSQL during transition

```typescript
// Dual-write pattern
async function createTask(data: CreateTaskRequest): Promise<Task> {
  // Write to PostgreSQL (new)
  const dbTask = await prisma.task.create({ data });
  
  // Write to JSON (old) - for rollback safety
  await writeToJsonFile(dbTask);
  
  return dbTask;
}
```

**Duration:** Deploy this, monitor for 1 hour, ensure no errors

### Phase 4: Read from PostgreSQL (Low Risk)

1. **Switch reads** to PostgreSQL
2. **Keep dual-writes** active
3. **Monitor** Railway logs for errors
4. **Duration:** 30 minutes observation

### Phase 5: Remove JSON File Code (Breaking Change)

1. Delete `storage.service.ts`
2. Remove all JSON file references
3. Delete `backend/data/` directory
4. **Deploy** with confidence

### Phase 6: Cleanup (Post-Migration)

1. Remove dual-write code
2. Archive old JSON files as backup
3. Update documentation

---

## Rollback Plan

### If Migration Fails in Phase 3-4:

1. **Immediate:** Revert to previous Railway deployment (1-click rollback)
2. **Data:** JSON file still has all data (dual-write preserved it)
3. **Downtime:** ~30 seconds (Railway redeploy)

### If Migration Fails in Phase 5:

1. **Restore:** Redeploy previous commit
2. **Data Recovery:** Export from PostgreSQL, import to JSON
3. **Downtime:** ~2 minutes

### Disaster Recovery:

- Supabase has automatic backups (last 7 days on free tier)
- Can restore to any point in time
- Export PostgreSQL data as CSV via Supabase dashboard

---

## Code Changes Required

### 1. New Files

```
backend/
├── prisma/
│   ├── schema.prisma          # Prisma schema definition
│   ├── migrations/            # Migration history
│   │   └── 20260126_init/
│   │       └── migration.sql
│   └── seed.ts                # Seed data for testing
├── src/
│   ├── lib/
│   │   └── prisma.ts          # Prisma client singleton
│   └── services/
│       └── task.service.ts    # Refactored to use Prisma
```

### 2. Files to Modify

- `backend/package.json` - Add Prisma dependencies
- `backend/src/services/task.service.ts` - Replace JSON with Prisma
- `backend/tsconfig.json` - Add Prisma client path
- `backend/.env` - Add `DATABASE_URL`

### 3. Files to Delete

- `backend/src/services/storage.service.ts` ❌
- `backend/data/tasks.json` ❌
- `backend/data/tasks.json.lock` ❌

### 4. Documentation to Update

- `README.md` - Database setup instructions
- `DEPLOYMENT.md` - Supabase setup steps
- `API_AUDIT.md` - Update storage section
- `DEPLOYMENT_CHECKLIST.md` - Add database checks
- Delete: `BOOTSTRAP.md` (if exists)

---

## Testing Strategy

### Unit Tests

```typescript
// backend/src/services/task.service.test.ts
describe('Task Service with PostgreSQL', () => {
  beforeAll(async () => {
    // Setup test database
    await prisma.$connect();
  });

  afterAll(async () => {
    // Cleanup
    await prisma.task.deleteMany();
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    // Clear data between tests
    await prisma.task.deleteMany();
  });

  it('creates a task', async () => {
    const task = await createTask({
      title: 'Test',
      description: 'Test desc',
      model_strategy: 'sonnet-coding',
    });
    
    expect(task.id).toBeDefined();
    expect(task.title).toBe('Test');
  });

  it('filters tasks by assignee', async () => {
    await createTask({ ...baseTask, assignee: 'rufus' });
    await createTask({ ...baseTask, assignee: 'james' });
    
    const rufusTasks = await getAllTasks('rufus');
    expect(rufusTasks).toHaveLength(1);
  });

  it('tracks LLM usage', async () => {
    const task = await createTask(baseTask);
    await addLLMUsage(task.id, {
      model: 'claude-sonnet-4.5',
      tokens_in: 100,
      tokens_out: 200,
      cost: 0.015,
    });
    
    const usage = await getLLMUsage(task.id);
    expect(usage).toHaveLength(1);
  });
});
```

### Integration Tests

```typescript
// backend/src/routes/task.routes.test.ts
describe('Task API with PostgreSQL', () => {
  it('creates and retrieves a task', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .set('X-API-Key', process.env.AGENT_API_KEY!)
      .send({
        title: 'Integration test',
        description: 'Test',
        model_strategy: 'sonnet-coding',
        assignee: 'rufus',
      });
    
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    
    const taskId = res.body.data.id;
    
    const getRes = await request(app)
      .get(`/api/tasks/${taskId}`)
      .set('X-API-Key', process.env.AGENT_API_KEY!);
    
    expect(getRes.status).toBe(200);
    expect(getRes.body.data.title).toBe('Integration test');
  });
});
```

### Manual Testing Checklist

- [ ] Create task via API (curl)
- [ ] Create task via UI (web browser)
- [ ] Filter tasks by assignee
- [ ] Update task status
- [ ] Delete task
- [ ] Verify data persists after Railway restart
- [ ] Check Supabase dashboard shows correct data
- [ ] Verify structured logging includes database queries
- [ ] Test rollback procedure

---

## Performance Considerations

### Connection Pooling

Prisma handles connection pooling automatically. For high load:

```typescript
// backend/src/lib/prisma.ts
const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

// Connection pool config (via DATABASE_URL)
// postgresql://user:pass@host:5432/db?connection_limit=10&pool_timeout=20
```

### Query Optimization

- ✅ Indexes already defined in schema
- ✅ Use `select` to limit fields returned
- ✅ Batch queries with `prisma.task.findMany()`
- ✅ Use transactions for multi-step operations

### Caching Strategy (Future)

For read-heavy workloads:
- Redis cache for task lists
- Invalidate on writes
- TTL: 60 seconds

**Not needed for MVP** (< 1000 tasks)

---

## Security Considerations

### 1. Connection String Security

```bash
# Never commit this!
DATABASE_URL="postgresql://user:password@host:5432/db"
```

**Storage:** Railway environment variable (encrypted at rest)

### 2. Row-Level Security

- ✅ Enabled on all tables
- ✅ Policies defined for read/write
- 🟡 Currently permissive - tighten for multi-user

### 3. SQL Injection

- ✅ Prisma uses parameterized queries (safe)
- ✅ No raw SQL in application code
- ✅ Validation at API layer (express-validator)

### 4. Audit Logging

PostgreSQL logs all queries. Enable in Supabase for compliance:
- Settings → Database → Logging
- Enable query logging for audit trail

---

## Cost Analysis

### Supabase Free Tier Limits

- Database size: 500 MB (sufficient for ~100k tasks)
- Bandwidth: 5 GB/month
- API requests: Unlimited (with rate limits)

### Growth Projections

| Tasks | Database Size | Estimated Cost |
|-------|---------------|----------------|
| 10,000 | ~50 MB | Free |
| 100,000 | ~500 MB | Free (at limit) |
| 1M | ~5 GB | $25/month (Pro tier) |

**Recommendation:** Stay on free tier until hitting limits.

---

## Post-Migration Monitoring

### Key Metrics to Track

1. **Query Performance:**
   - Average query time (should be < 50ms)
   - Slow query log (> 100ms)

2. **Database Size:**
   - Growth rate
   - Alert at 400 MB (80% of free tier)

3. **Connection Pool:**
   - Active connections
   - Pool exhaustion errors

4. **Error Rates:**
   - Database connection failures
   - Transaction rollbacks

### Logging

```typescript
// backend/src/lib/logger.ts
logger.info('Database query', {
  query: 'tasks.findMany',
  duration: '23ms',
  results: 15,
});
```

---

## Documentation Updates

### README.md

```markdown
## Database Setup

1. Create Supabase account at https://supabase.com
2. Create new project
3. Get connection string from Project Settings → Database
4. Add to Railway:
   ```bash
   railway variables set DATABASE_URL="postgresql://..."
   ```
5. Run migrations:
   ```bash
   cd backend
   npx prisma migrate deploy
   ```
```

### DEPLOYMENT.md

Add section:
- Database connection setup
- Migration commands
- Rollback procedure
- Backup/restore instructions

### API_AUDIT.md

Update storage section:
- Remove JSON file references
- Add PostgreSQL + Prisma
- Note connection pooling
- Security posture (RLS)

---

## Timeline & Task Breakdown

### Phase 1: Setup (30 min)
- [ ] Install Prisma dependencies
- [ ] Create schema.prisma
- [ ] Configure DATABASE_URL in Railway
- [ ] Create initial migration

### Phase 2: Implementation (1 hour)
- [ ] Create Prisma client singleton
- [ ] Refactor task.service.ts
- [ ] Add LLM usage tracking
- [ ] Update tests

### Phase 3: Testing (20 min)
- [ ] Run unit tests locally
- [ ] Manual API testing
- [ ] Test against Supabase dev database

### Phase 4: Deploy (10 min)
- [ ] Push to GitHub
- [ ] Railway auto-deploys
- [ ] Run migrations in production
- [ ] Verify health endpoint

### Phase 5: Cleanup (10 min)
- [ ] Delete old storage service
- [ ] Update documentation
- [ ] Commit final changes

**Total:** ~2 hours 10 minutes

---

## Success Criteria

- ✅ All tests pass (unit + integration)
- ✅ No data loss during migration
- ✅ Health endpoint returns 200
- ✅ Tasks persist across Railway restarts
- ✅ Query performance < 50ms average
- ✅ Zero downtime during migration
- ✅ Documentation updated and accurate
- ✅ Rollback procedure tested and documented

---

## Risks & Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Data loss during migration | HIGH | LOW | Dual-write strategy, backups |
| Supabase connection failure | HIGH | LOW | Connection retry logic, Railway rollback |
| Performance degradation | MEDIUM | LOW | Indexes, connection pooling |
| Migration script fails | MEDIUM | MEDIUM | Test locally first, staged deployment |
| Wrong DATABASE_URL | MEDIUM | MEDIUM | Validate in pre-deploy checklist |

---

## Next Steps

1. **Approval:** Review this plan with James
2. **Execution:** Switch to Sonnet 4.5 for implementation
3. **Audit:** Opus 4.5 post-implementation review

---

## Appendix: Environment Variables

```bash
# Railway Production
DATABASE_URL="postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres"
SUPABASE_URL="https://[project].supabase.co"
SUPABASE_ANON_KEY="[public_anon_key]"
SUPABASE_SERVICE_KEY="[service_role_key]"
AGENT_API_KEY="[rufus_api_key]"
ALLOWED_ORIGINS="https://clawban-eight.vercel.app"
NODE_ENV="production"
LOG_LEVEL="info"
```

---

**END OF MIGRATION PLAN**

**Next Action:** Await approval, then switch to Sonnet 4.5 for execution phase.

---

## CRITICAL: Frontend UI Updates for Assignee

**Current Gap:** Backend supports assignee field, but frontend UI is missing:
- ❌ No way to set assignee when creating tasks
- ❌ No way to see who a task is assigned to
- ❌ No way to filter tasks by assignee
- ❌ No way to reassign tasks

**This must be implemented as part of the migration!**

### Frontend Changes Required

#### 1. CreateTaskForm - Add Assignee Dropdown

**File:** `frontend/src/components/CreateTaskForm.tsx`

```tsx
// Add to form state
const [assignee, setAssignee] = useState<'rufus' | 'james' | null>(null);

// Add to form UI (after model strategy dropdown)
<div>
  <label htmlFor="assignee">Assign To</label>
  <select 
    id="assignee"
    value={assignee || ''}
    onChange={(e) => setAssignee(e.target.value as any || null)}
  >
    <option value="">Unassigned</option>
    <option value="rufus">🤖 Rufus (AI Assistant)</option>
    <option value="james">👤 James</option>
  </select>
</div>

// Include in API call
await createTask({
  title,
  description,
  model_strategy,
  assignee,
});
```

#### 2. KanbanBoard - Add Filter Buttons

**File:** `frontend/src/components/KanbanBoard.tsx`

```tsx
// Add filter state
const [assigneeFilter, setAssigneeFilter] = useState<'all' | 'rufus' | 'james' | 'unassigned'>('all');

// Update query to include filter
const { data, isLoading } = useQuery({
  queryKey: ['tasks', assigneeFilter],
  queryFn: () => {
    if (assigneeFilter === 'all') return listTasks();
    if (assigneeFilter === 'unassigned') return listTasks(null);
    return listTasks(assigneeFilter);
  },
});

// Add filter UI (above the board)
<div className="filter-buttons">
  <button 
    onClick={() => setAssigneeFilter('all')}
    className={assigneeFilter === 'all' ? 'active' : ''}
  >
    All Tasks
  </button>
  <button 
    onClick={() => setAssigneeFilter('james')}
    className={assigneeFilter === 'james' ? 'active' : ''}
  >
    👤 My Tasks
  </button>
  <button 
    onClick={() => setAssigneeFilter('rufus')}
    className={assigneeFilter === 'rufus' ? 'active' : ''}
  >
    🤖 Rufus's Tasks
  </button>
  <button 
    onClick={() => setAssigneeFilter('unassigned')}
    className={assigneeFilter === 'unassigned' ? 'active' : ''}
  >
    📋 Unassigned
  </button>
</div>
```

#### 3. TaskCard - Show Assignee Badge

**File:** `frontend/src/components/TaskCard.tsx`

```tsx
// Add assignee badge (in card header, next to title)
{task.assignee && (
  <span className={`assignee-badge assignee-${task.assignee}`}>
    {task.assignee === 'rufus' ? '🤖 Rufus' : '👤 James'}
  </span>
)}

// Add CSS
.assignee-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.assignee-rufus {
  background: #e3f2fd;
  color: #1976d2;
}

.assignee-james {
  background: #f3e5f5;
  color: #7b1fa2;
}
```

#### 4. Update API Client - Support Filter Parameter

**File:** `frontend/src/api/client.ts`

```tsx
/**
 * List all tasks with optional assignee filter
 */
export async function listTasks(assignee?: string | null): Promise<ListTasksResponse> {
  const headers = await getAuthHeaders();
  
  // Build query string
  const params = new URLSearchParams();
  if (assignee !== undefined) {
    params.append('assignee', assignee === null ? 'null' : assignee);
  }
  
  const query = params.toString() ? `?${params.toString()}` : '';
  const response = await fetch(`${API_BASE}/api/tasks${query}`, { headers });
  return handleResponse<ListTasksResponse>(response);
}
```

#### 5. Optional: Reassign Task Feature

**File:** Add to TaskCard or create TaskDetailsModal

```tsx
// Quick reassign dropdown on task card
<select 
  value={task.assignee || ''}
  onChange={(e) => handleReassign(task.id, e.target.value || null)}
>
  <option value="">Unassigned</option>
  <option value="rufus">Rufus</option>
  <option value="james">James</option>
</select>

async function handleReassign(taskId: string, newAssignee: string | null) {
  await updateTask(taskId, { assignee: newAssignee });
  queryClient.invalidateQueries(['tasks']);
}
```

### Frontend Files to Modify

- ✅ `frontend/src/components/CreateTaskForm.tsx` - Add assignee dropdown
- ✅ `frontend/src/components/KanbanBoard.tsx` - Add filter buttons + filter logic
- ✅ `frontend/src/components/TaskCard.tsx` - Show assignee badge
- ✅ `frontend/src/api/client.ts` - Support assignee query param
- ✅ `frontend/src/index.css` - Add assignee badge styles

### Updated Timeline with Frontend

| Phase | Duration | Description |
|-------|----------|-------------|
| **Backend: Prisma Setup** | 30 min | Install, schema, migrations |
| **Backend: Implementation** | 1 hour | Refactor services to use Prisma |
| **Backend: Testing** | 20 min | Unit + integration tests |
| **Frontend: Assignee UI** | 45 min | All 4 components above |
| **Deploy & Verify** | 15 min | Railway + Vercel deploy |
| **Cleanup** | 10 min | Remove old code, update docs |

**New Total: 3 hours 30 minutes**

---

## Updated Success Criteria

- ✅ All tests pass (unit + integration)
- ✅ No data loss during migration
- ✅ Tasks persist across Railway restarts
- ✅ **Frontend shows assignee on all tasks**
- ✅ **Filter buttons work correctly**
- ✅ **Can assign tasks when creating**
- ✅ **Can see who each task is assigned to**
- ✅ Query performance < 50ms average
- ✅ Documentation updated and accurate

