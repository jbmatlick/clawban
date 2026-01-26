# AI Agent Access - Rufus & Clawban

## Overview

Clawban now supports **two-way task management** between humans (James) and AI agents (Rufus):

- **James** (human) → Auth via Supabase JWT, uses web UI
- **Rufus** (AI agent) → Auth via API key, uses API directly

Both can create, update, and assign tasks to each other.

---

## Authentication Methods

### 1. Supabase JWT (Human Users)
- Used by web UI
- Header: `Authorization: Bearer <supabase_jwt>`
- Managed automatically by frontend AuthContext

### 2. API Key (AI Agents)
- Used by AI agents like Rufus
- Header: `X-API-Key: <agent_api_key>`
- Set via Railway environment variable

---

## Setup: Generate API Key for Rufus

```bash
# Generate a secure API key
openssl rand -base64 32

# Set in Railway
cd ~/clawd/clawban
railway variables set AGENT_API_KEY="<generated_key>"
```

**Store the key securely** - Rufus will need this to access the API.

---

## Task Assignee Field

Tasks now have an `assignee` field:

```typescript
type TaskAssignee = 'rufus' | 'james' | null;

interface Task {
  // ... other fields
  assignee: TaskAssignee;
}
```

- `'rufus'` - Assigned to Rufus (AI agent)
- `'james'` - Assigned to James (human)
- `null` - Unassigned (either can pick it up)

---

## API Usage for Rufus

### Create a Task for Yourself

```bash
curl -X POST https://clawban-production.up.railway.app/api/tasks \
  -H "X-API-Key: <your_api_key>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Research GraphQL best practices",
    "description": "Analyze popular GraphQL APIs and document patterns",
    "model_strategy": "sonnet-coding",
    "assignee": "rufus"
  }'
```

### Assign a Task to James

```bash
curl -X POST https://clawban-production.up.railway.app/api/tasks \
  -H "X-API-Key: <your_api_key>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Review API design",
    "description": "Review the new endpoint structure and approve",
    "model_strategy": "opus-planning",
    "assignee": "james"
  }'
```

### Filter Tasks by Assignee

```bash
# Get only Rufus's tasks
curl https://clawban-production.up.railway.app/api/tasks?assignee=rufus \
  -H "X-API-Key: <your_api_key>"

# Get only James's tasks
curl https://clawban-production.up.railway.app/api/tasks?assignee=james \
  -H "X-API-Key: <your_api_key>"

# Get unassigned tasks
curl https://clawban-production.up.railway.app/api/tasks?assignee=null \
  -H "X-API-Key: <your_api_key>"
```

### Update Task Status

```bash
curl -X PATCH https://clawban-production.up.railway.app/api/tasks/<task_id> \
  -H "X-API-Key: <your_api_key>" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "in-progress"
  }'
```

### Reassign a Task

```bash
curl -X PATCH https://clawban-production.up.railway.app/api/tasks/<task_id> \
  -H "X-API-Key: <your_api_key>" \
  -H "Content-Type: application/json" \
  -d '{
    "assignee": "james"
  }'
```

---

## Workflow Examples

### 1. Rufus Self-Manages Work

**User:** "Research authentication patterns for SaaS apps"

**Rufus:**
1. Creates task via API: `assignee: 'rufus'`
2. Updates status: `in-progress`
3. Does the research
4. Updates with findings in description
5. Marks `complete`

### 2. Rufus Assigns Work to James

**User:** "Make sure we have a security audit for the API"

**Rufus:**
1. Creates task via API: `assignee: 'james'`
2. James sees it in UI
3. James completes and marks done

### 3. James Assigns Work to Rufus

**James (via UI):**
1. Creates task
2. Sets `assignee: 'rufus'`
3. Rufus queries API: `GET /api/tasks?assignee=rufus`
4. Rufus works on it and updates status

---

## Frontend UI Updates (Next Step)

The frontend needs these changes:

1. **Assignee field in CreateTaskForm**
   - Dropdown: "Unassigned" | "Rufus" | "James"

2. **Assignee badge on task cards**
   - Show who it's assigned to

3. **Filter buttons in KanbanBoard**
   - "All Tasks" | "My Tasks (James)" | "Rufus's Tasks" | "Unassigned"

4. **Reassign action**
   - Click task → "Reassign to..." dropdown

---

## Migration

Run once after deployment to add `assignee: null` to existing tasks:

```bash
cd ~/clawd/clawban/backend
npm run migrate:assignee
```

This is safe to run multiple times (idempotent).

---

## Security Notes

- **API key is sensitive** - treat like a password
- API key grants full access (same as authenticated user)
- Rotate key if compromised: generate new one, update Railway
- Consider adding rate limiting per API key if abuse occurs

---

## Monitoring

Check Railway logs to see agent API calls:

```bash
railway logs --tail 100 | grep "Agent authenticated"
```

You'll see:
```json
{
  "level": "info",
  "message": "Agent authenticated",
  "requestId": "abc123",
  "agentId": "rufus"
}
```

---

## Next Steps

1. ✅ Deploy backend with assignee support
2. ⏳ Update frontend UI (assignee field + filtering)
3. ⏳ Give Rufus the API key
4. ⏳ Test end-to-end workflow
5. ⏳ Add LLM usage tracking when Rufus completes tasks
