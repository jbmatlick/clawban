# Clawban API - Route Registry

**Last Updated:** 2026-01-26  
**Purpose:** Single source of truth for all API routes  
**Rule:** Update this file BEFORE adding new routes

---

## Route Audit Status

✅ **No duplicate routes detected**  
✅ **All routes follow RESTful conventions**  
✅ **All routes have validation middleware**

---

## Health & Status

### GET /health
**Purpose:** Basic health check for load balancers  
**Auth:** None (public)  
**Params:** None  
**Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-01-26T10:00:00.000Z"
}
```

---

## Tasks (`/api/tasks`)

### GET /api/tasks
**Purpose:** List all tasks with optional filtering  
**Auth:** Required (JWT)  
**Query Params:**
- `status` (optional): Filter by status
- `assignee` (optional): Filter by assignee
- `tag` (optional): Filter by tag name

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Task title",
      "description": "Markdown description",
      "model_strategy": "opus-coding",
      "estimated_token_cost": 50000,
      "estimated_dollar_cost": 1.50,
      "status": "new",
      "assignee": "rufus",
      "tags": ["bug", "urgent"],
      "created_at": "2026-01-26T10:00:00.000Z",
      "updated_at": "2026-01-26T10:00:00.000Z",
      "completed_at": null,
      "llm_usage": []
    }
  ]
}
```

**Validation:** None (query params optional)  
**Controller:** `taskController.listTasks`  
**Service:** `taskService.listTasks`

---

### GET /api/tasks/:id
**Purpose:** Get single task by ID  
**Auth:** Required (JWT)  
**Params:**
- `id` (required): Task UUID

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Task title",
    ...
  }
}
```

**Errors:**
- 404: Task not found

**Validation:** `idParamValidator`  
**Controller:** `taskController.getTask`  
**Service:** `taskService.getTaskById`

---

### POST /api/tasks
**Purpose:** Create new task  
**Auth:** Required (JWT)  
**Body:**
```json
{
  "title": "Task title (required, 1-200 chars)",
  "description": "Markdown description (optional)",
  "model_strategy": "opus-coding (required)",
  "estimated_token_cost": 50000,
  "estimated_dollar_cost": 1.50,
  "assignee": "rufus (optional)"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Task title",
    "status": "new",
    ...
  }
}
```

**Validation:** `createTaskValidators`
- title: 1-200 chars, required
- description: optional
- model_strategy: enum ['opus-planning', 'opus-coding', 'sonnet-coding', 'mixed']
- estimated_token_cost: number >= 0
- estimated_dollar_cost: number >= 0
- assignee: optional string

**Controller:** `taskController.createTask`  
**Service:** `taskService.createTask`

---

### PATCH /api/tasks/:id
**Purpose:** Update existing task (partial update)  
**Auth:** Required (JWT)  
**Params:**
- `id` (required): Task UUID

**Body:** (all fields optional)
```json
{
  "title": "Updated title",
  "description": "Updated description",
  "model_strategy": "sonnet-coding",
  "estimated_token_cost": 30000,
  "estimated_dollar_cost": 0.90,
  "status": "in-progress",
  "assignee": "james"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Updated title",
    ...
  }
}
```

**Errors:**
- 404: Task not found
- 400: Validation error

**Validation:** `idParamValidator` + `updateTaskValidators`  
**Controller:** `taskController.updateTask`  
**Service:** `taskService.updateTask`

---

### DELETE /api/tasks/:id
**Purpose:** Delete task permanently  
**Auth:** Required (JWT)  
**Params:**
- `id` (required): Task UUID

**Response:**
```json
{
  "success": true,
  "data": null
}
```

**Errors:**
- 404: Task not found

**Validation:** `idParamValidator`  
**Controller:** `taskController.deleteTask`  
**Service:** `taskService.deleteTask`

---

### POST /api/tasks/:id/move
**Purpose:** Move task to different status column  
**Auth:** Required (JWT)  
**Params:**
- `id` (required): Task UUID

**Body:**
```json
{
  "status": "approved" // Required
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "approved",
    "updated_at": "2026-01-26T10:05:00.000Z",
    "completed_at": "2026-01-26T10:05:00.000Z" // If status="complete"
  }
}
```

**Validation:** `idParamValidator` + `moveTaskValidators`
- status: enum ['new', 'approved', 'in-progress', 'complete']

**Controller:** `taskController.moveTask`  
**Service:** `taskService.moveTask`

---

## Tags (`/api/tags`)

### GET /api/tags
**Purpose:** List all tags with usage counts  
**Auth:** Required (JWT)  
**Params:** None

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "bug",
      "color": "#ff6b6b",
      "created_at": "2026-01-26T10:00:00.000Z",
      "task_count": 5
    }
  ]
}
```

**Validation:** None  
**Controller:** `tagController.listTags`  
**Service:** `tagService.listTags`

**Note:** Tags are auto-created when used in tasks. No manual CRUD needed yet.

---

## Gateway (`/api/gateway`)

### GET /api/gateway/health
**Purpose:** Check Clawdbot gateway health status  
**Auth:** Required (JWT)  
**Params:** None

**Response:**
```json
{
  "success": true,
  "healthy": true,
  "timestamp": "2026-01-26T10:00:00.000Z",
  "gateway": "http://localhost:18789"
}
```

**Errors:**
```json
{
  "success": true,
  "healthy": false,
  "timestamp": "2026-01-26T10:00:00.000Z",
  "gateway": "http://localhost:18789",
  "error": "Connection refused"
}
```

**Controller:** `gatewayRoutes`  
**External Call:** Clawdbot Gateway `/api/v1/call` → `health` method

---

### POST /api/gateway/restart
**Purpose:** Restart Clawdbot gateway daemon  
**Auth:** Required (JWT)  
**Params:** None  
**Body:** None

**Response:**
```json
{
  "success": true,
  "message": "Gateway restart initiated",
  "timestamp": "2026-01-26T10:00:00.000Z"
}
```

**Errors:**
- 500: Gateway unreachable or restart failed

**Controller:** `gatewayRoutes`  
**External Call:** Clawdbot Gateway `/api/v1/call` → `gateway.restart` method

---

## Route Standards

### RESTful Conventions ✅
- **GET**: Read resources (safe, idempotent)
- **POST**: Create resources or non-idempotent actions
- **PATCH**: Partial update (idempotent)
- **PUT**: Full replacement (idempotent) - not used yet
- **DELETE**: Remove resources (idempotent)

### Naming ✅
- Plural nouns for collections: `/api/tasks`
- Singular for single resource: `/api/tasks/:id`
- Actions as nested paths: `/api/tasks/:id/move`

### Response Format ✅
All responses use consistent shape:
```json
{
  "success": true,   // boolean
  "data": { ... },   // payload (null if none)
  "error": "..."     // string (only if success=false)
}
```

### Authentication ✅
- Health endpoint: Public (no auth)
- All `/api/*` endpoints: JWT required via `requireAuth` middleware

### Validation ✅
- All endpoints have express-validator middleware
- Validation errors return 400 with details
- Type safety enforced via contracts/types.ts

---

## Pre-Merge Checklist

Before adding a new route:

1. [ ] Check this file for existing similar endpoints
2. [ ] Verify RESTful naming (plural nouns, correct HTTP verb)
3. [ ] Add to this ROUTES.md file
4. [ ] Add validation middleware
5. [ ] Add controller + service methods
6. [ ] Add unit tests for service
7. [ ] Add integration test for route
8. [ ] Update OpenAPI spec (when available)
9. [ ] Run `npm run audit:routes` (when script is ready)

---

## Future Routes (Planned)

### Task Comments
- POST /api/tasks/:id/comments
- GET /api/tasks/:id/comments
- PATCH /api/tasks/:id/comments/:commentId
- DELETE /api/tasks/:id/comments/:commentId

### LLM Usage Logging
- POST /api/tasks/:id/llm-usage
- GET /api/tasks/:id/llm-usage

### User Management
- GET /api/users
- GET /api/users/:id
- PATCH /api/users/:id

### Task Templates
- GET /api/templates
- POST /api/templates
- POST /api/templates/:id/create-task

---

**Last Audit:** 2026-01-26  
**Total Routes:** 10  
**Duplicate Routes:** 0  
**Non-RESTful Routes:** 0
