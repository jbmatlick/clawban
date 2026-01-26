# Clawban Code Audit Report

*Conducted by: Claude Opus 4.5*  
*Date: January 26, 2026*

---

## Executive Summary

Clawban demonstrates **solid foundational architecture** with clean separation of concerns, proper TypeScript strict mode, and zero `any` types. The shared contracts pattern ensures type safety across the stack. However, there are **critical race conditions** in the storage layer, **permissive CORS configuration**, and **broken tooling** (ESLint uses deprecated config format, tests fail). The frontend lacks tests, error boundaries, and performance optimizations. Overall: **B+ architecture, C+ production readiness**.

---

## Critical Issues (🔴)

### 1. Race Condition in Storage Service
**File:** `backend/src/services/task.service.ts` (lines 37-55, 63-83, 91-101)  
**File:** `backend/src/services/storage.service.ts` (lines 30-40)

**Problem:** Every task operation follows a read-modify-write pattern without any locking mechanism. Concurrent requests can cause lost updates.

```typescript
// Current pattern (UNSAFE):
const data = await readData<TasksData>();  // Thread A reads
// ... Thread B also reads same data ...
data.tasks.push(newTask);                   // Thread A modifies
await writeData(data);                      // Thread A writes
// Thread B writes, overwriting Thread A's changes
```

**Why it matters:** In production, simultaneous task creation/updates will silently lose data. This is a data corruption bug.

**Recommended fix:**
```typescript
// Option A: File locking with proper-lockfile
import lockfile from 'proper-lockfile';

export async function withLock<T>(fn: () => Promise<T>): Promise<T> {
  const release = await lockfile.lock(TASKS_FILE, { retries: 3 });
  try {
    return await fn();
  } finally {
    await release();
  }
}

// Option B: Migrate to SQLite or better (recommended for production)
```

**Severity:** 🔴 Critical

---

### 2. Permissive CORS Configuration
**File:** `backend/src/index.ts` (line 14)

**Problem:** CORS is configured with no options, allowing requests from ANY origin:
```typescript
app.use(cors());  // Allows all origins!
```

**Why it matters:** Any website can make authenticated requests to your API. This enables CSRF attacks and data exfiltration.

**Recommended fix:**
```typescript
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
}));
```

**Severity:** 🔴 Critical (for production deployment)

---

### 3. No Route Parameter Validation
**File:** `backend/src/controllers/task.controller.ts` (lines 46, 121, 154, 196)  
**File:** `backend/src/routes/task.routes.ts` (lines 13, 16, 19, 22)

**Problem:** The `id` parameter is extracted directly from URL params without validation:
```typescript
const { id } = req.params;
const task = await taskService.getTaskById(id);  // Any string accepted
```

**Why it matters:** While not exploitable for injection (JSON storage), missing validation means:
- No length limits on ID strings
- No format validation (could store garbage)
- Unclear API contract

**Recommended fix:**
```typescript
// In validators.ts
import { param } from 'express-validator';

export const idParamValidator = [
  param('id')
    .isString()
    .isLength({ min: 1, max: 30 })
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Invalid task ID format'),
];

// In routes
router.get('/:id', idParamValidator, taskController.getTask);
```

**Severity:** 🔴 Critical (input validation gap)

---

## High Priority (🟡)

### 4. ESLint Configuration Broken
**Files:** `backend/.eslintrc.json`, `frontend/.eslintrc.json`

**Problem:** ESLint 9.x requires `eslint.config.js` (flat config format). The project uses deprecated `.eslintrc.json`:
```
ESLint: 9.39.2
ESLint couldn't find an eslint.config.(js|mjs|cjs) file.
```

**Why it matters:** `npm run lint` fails completely. No linting is happening.

**Recommended fix:** Convert to flat config:
```javascript
// eslint.config.js
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  }
);
```

**Severity:** 🟡 High

---

### 5. Backend Tests Failing
**File:** `backend/src/services/task.service.test.ts` (line 5)

**Problem:** Unused import causes TypeScript error in tests:
```typescript
import { describe, test, expect, beforeEach } from '@jest/globals';
//                              ^^^^^^^^^^^ declared but never used
```

**Why it matters:** Test suite doesn't run. Zero test coverage in CI.

**Recommended fix:**
```typescript
import { describe, test, expect } from '@jest/globals';  // Remove beforeEach
```

**Severity:** 🟡 High

---

### 6. Zero Frontend Tests
**Directory:** `frontend/src/` (no `.test.tsx` files)

**Problem:** Vitest is configured but no tests exist:
```
No test files found, exiting with code 1
```

**Why it matters:** No confidence in UI behavior. Refactoring is risky.

**Recommended fix:** Add at least these critical tests:
```typescript
// src/components/TaskCard.test.tsx
import { render, screen } from '@testing-library/react';
import { TaskCard } from './TaskCard';

describe('TaskCard', () => {
  it('renders task title', () => {
    render(<TaskCard task={mockTask} />);
    expect(screen.getByText('Test Task')).toBeInTheDocument();
  });

  it('formats cost correctly', () => {
    render(<TaskCard task={{ ...mockTask, estimated_dollar_cost: 1.5 }} />);
    expect(screen.getByText('$1.50')).toBeInTheDocument();
  });
});
```

**Severity:** 🟡 High

---

### 7. Unused TypeScript Imports
**Files:** `frontend/src/api/hooks.ts:7`, `frontend/src/components/KanbanBoard.tsx:6`

**Problem:** TypeScript reports unused imports:
```
src/api/hooks.ts(7,3): error TS6196: 'Task' is declared but never used.
src/components/KanbanBoard.tsx(6,15): error TS6196: 'Task' is declared but never used.
```

**Why it matters:** `npm run typecheck` fails. CI pipeline broken.

**Recommended fix:**
```typescript
// hooks.ts - Remove Task from import
import type {
  CreateTaskRequest,
  UpdateTaskRequest,
  MoveTaskRequest,
} from '../../../contracts/types';

// KanbanBoard.tsx - Remove Task from import
import type { TaskStatus } from '../../../contracts/types';
```

**Severity:** 🟡 High

---

### 8. No Description Length Limit
**File:** `backend/src/middleware/validators.ts` (lines 16-20, 41-45)

**Problem:** Description validation only checks `min: 1`, no maximum:
```typescript
body('description')
  .isString()
  .trim()
  .isLength({ min: 1 })  // No max!
  .withMessage('Description is required'),
```

**Why it matters:** Users can submit megabytes of text, causing:
- Storage bloat
- UI rendering issues
- Potential DoS

**Recommended fix:**
```typescript
body('description')
  .isString()
  .trim()
  .isLength({ min: 1, max: 10000 })
  .withMessage('Description must be between 1 and 10,000 characters'),
```

**Severity:** 🟡 High

---

## Medium Priority (🟠)

### 9. No Optimistic Updates for Drag-and-Drop
**File:** `frontend/src/api/hooks.ts` (lines 61-73)

**Problem:** `useMoveTask` hook doesn't implement optimistic updates:
```typescript
export function useMoveTask() {
  return useMutation({
    mutationFn: ...,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tasks });
    },
    // Missing: onMutate for optimistic update
  });
}
```

**Why it matters:** Drag-and-drop feels sluggish. Card snaps back then jumps to new position.

**Recommended fix:**
```typescript
export function useMoveTask() {
  return useMutation({
    mutationFn: ...,
    onMutate: async ({ id, request }) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.tasks });
      const previous = queryClient.getQueryData(QUERY_KEYS.tasks);
      
      queryClient.setQueryData(QUERY_KEYS.tasks, (old) => ({
        ...old,
        tasks: old.tasks.map((t) => 
          t.id === id ? { ...t, status: request.status } : t
        ),
      }));
      
      return { previous };
    },
    onError: (err, vars, context) => {
      queryClient.setQueryData(QUERY_KEYS.tasks, context.previous);
    },
  });
}
```

**Severity:** 🟠 Medium (UX degradation)

---

### 10. No React Error Boundaries
**Directory:** `frontend/src/`

**Problem:** No error boundaries wrapping the app. Unhandled errors crash the entire UI.

**Why it matters:** A single component error takes down the whole board.

**Recommended fix:**
```typescript
// src/components/ErrorBoundary.tsx
import { Component, ReactNode } from 'react';

interface Props { children: ReactNode; fallback?: ReactNode; }
interface State { hasError: boolean; }

export class ErrorBoundary extends Component<Props, State> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <div>Something went wrong</div>;
    }
    return this.props.children;
  }
}
```

**Severity:** 🟠 Medium

---

### 11. No Component Memoization
**Files:** `frontend/src/components/TaskCard.tsx`, `KanbanColumn.tsx`

**Problem:** No `React.memo`, `useMemo`, or `useCallback` usage. Every parent re-render causes all children to re-render.

**Why it matters:** With many tasks, drag operations become laggy.

**Recommended fix:**
```typescript
// TaskCard.tsx
export const TaskCard = React.memo(function TaskCard({ task }: TaskCardProps) {
  const deleteTask = useDeleteTask();
  
  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure?')) {
      deleteTask.mutate(task.id);
    }
  }, [deleteTask, task.id]);
  
  // ... rest
});
```

**Severity:** 🟠 Medium

---

### 12. Browser `confirm()` Dialog
**File:** `frontend/src/components/TaskCard.tsx` (line 26)

**Problem:** Uses native browser `confirm()` for delete confirmation:
```typescript
if (confirm('Are you sure you want to delete this task?')) {
```

**Why it matters:** 
- Blocks the main thread
- Inconsistent styling across browsers
- Can't be styled to match app theme
- Bad UX

**Recommended fix:** Use a proper modal component or toast with undo.

**Severity:** 🟠 Medium

---

### 13. Missing API Error Details
**File:** `backend/src/controllers/task.controller.ts` (multiple)

**Problem:** Error responses don't include useful debugging info:
```typescript
catch (error) {
  console.error('Error creating task:', error);
  res.status(500).json({
    success: false,
    error: 'Failed to create task',  // Generic, unhelpful
  });
}
```

**Why it matters:** Hard to debug production issues without error codes or request IDs.

**Recommended fix:**
```typescript
catch (error) {
  const requestId = req.headers['x-request-id'] || nanoid();
  console.error(`[${requestId}] Error creating task:`, error);
  res.status(500).json({
    success: false,
    error: 'Failed to create task',
    requestId,
    code: 'TASK_CREATE_FAILED',
  });
}
```

**Severity:** 🟠 Medium

---

## Low Priority (⚪)

### 14. Missing OpenAPI Documentation
**File:** `backend/package.json` (has swagger-ui-express dependency)

**Problem:** swagger-ui-express is installed but no OpenAPI spec file exists. No `/docs` endpoint.

**Recommended fix:** Add `openapi.yaml` and serve it:
```typescript
import YAML from 'yaml';
import swaggerUi from 'swagger-ui-express';

const spec = YAML.parse(fs.readFileSync('./openapi.yaml', 'utf8'));
app.use('/docs', swaggerUi.serve, swaggerUi.setup(spec));
```

**Severity:** ⚪ Low

---

### 15. No Request Rate Limiting
**File:** `backend/src/index.ts`

**Problem:** No rate limiting middleware. API can be easily abused.

**Recommended fix:**
```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use('/api/', limiter);
```

**Severity:** ⚪ Low (for internal tool)

---

### 16. No Environment Validation
**File:** `backend/src/index.ts`

**Problem:** Environment variables used without validation:
```typescript
const PORT = process.env.PORT || 3001;
```

**Recommended fix:** Use a schema validation library:
```typescript
import { z } from 'zod';

const envSchema = z.object({
  PORT: z.coerce.number().default(3001),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  ALLOWED_ORIGINS: z.string().optional(),
});

export const env = envSchema.parse(process.env);
```

**Severity:** ⚪ Low

---

### 17. Test Isolation Missing
**File:** `backend/src/services/task.service.test.ts`

**Problem:** Tests use production data file. Each test run pollutes data:
```typescript
const task = await taskService.createTask(mockTask);  // Creates real file entries
```

**Recommended fix:** Mock the storage service or use a test-specific data file:
```typescript
// jest.setup.ts
jest.mock('./storage.service', () => ({
  readData: jest.fn(() => ({ tasks: [] })),
  writeData: jest.fn(),
}));
```

**Severity:** ⚪ Low

---

### 18. Contracts Package Not Properly Linked
**File:** `contracts/package.json`

**Problem:** Frontend/backend import via relative paths (`../../../contracts/types`). Should use proper npm workspace linking.

**Recommended fix:** Configure npm workspaces in root:
```json
// package.json (root)
{
  "workspaces": ["backend", "frontend", "contracts"]
}

// Then import as:
import { Task } from '@clawban/contracts';
```

**Severity:** ⚪ Low

---

## Positive Highlights (✅)

### 1. Excellent TypeScript Configuration
Both `tsconfig.json` files have **strict mode enabled** with comprehensive checks:
- `"strict": true`
- `"noUnusedLocals": true`
- `"noUnusedParameters": true`
- `"noImplicitReturns": true`
- `"noFallthroughCasesInSwitch": true`

**Zero `any` types** found in the entire codebase. This is impressive discipline.

### 2. Clean Architecture & Separation of Concerns
```
backend/
  ├── controllers/  → HTTP handling
  ├── services/     → Business logic
  ├── middleware/   → Validation
  └── routes/       → Route definitions
```
This is textbook MVC. Easy to understand, test, and maintain.

### 3. Shared Type Contracts
The `contracts/` package ensures **type safety across the stack**. API responses are properly typed, preventing runtime type mismatches.

### 4. Modern React Patterns
- TanStack Query for data fetching (industry standard)
- Proper query key management
- Mutation hooks with cache invalidation
- Tailwind CSS v4 with CSS variables for theming

### 5. Thoughtful Validation
express-validator usage is comprehensive:
- String trimming
- Length limits
- Enum validation for status and strategy
- Proper error messages

### 6. Professional Project Structure
- Clear README with setup instructions
- Proper `.gitignore`
- MIT license
- Reasonable dependency choices

### 7. Good UX Touches
- Loading states with spinner
- Error states with messages
- Drag-and-drop visual feedback
- Responsive grid layout
- Clean color-coded columns

---

## Recommended Next Steps

### Phase 1: Critical Fixes (Do Now)
1. ✏️ **Fix race condition** - Add file locking OR migrate to SQLite
2. ✏️ **Configure CORS** - Restrict to known origins
3. ✏️ **Add ID validation** - Validate route params
4. ✏️ **Fix ESLint config** - Migrate to flat config
5. ✏️ **Fix TypeScript errors** - Remove unused imports
6. ✏️ **Fix backend tests** - Remove unused import, add test isolation

### Phase 2: High Priority (This Week)
7. ✏️ **Add description max length** - Prevent abuse
8. ✏️ **Add basic frontend tests** - At least smoke tests
9. ✏️ **Add optimistic updates** - Improve drag UX

### Phase 3: Polish (Next Sprint)
10. ✏️ **Add error boundaries** - Graceful error handling
11. ✏️ **Add memoization** - Performance optimization
12. ✏️ **Replace confirm()** - Proper modal
13. ✏️ **Add request IDs** - Better debugging
14. ✏️ **Add OpenAPI docs** - API documentation

### Phase 4: Future Enhancements
15. ✏️ **Add rate limiting** - Abuse prevention
16. ✏️ **Add env validation** - Configuration safety
17. ✏️ **Configure npm workspaces** - Clean imports

---

## Appendix: File Reference

| Issue | File | Line(s) |
|-------|------|---------|
| Race condition | `backend/src/services/task.service.ts` | 37-55, 63-83, 91-101 |
| CORS | `backend/src/index.ts` | 14 |
| ID validation | `backend/src/controllers/task.controller.ts` | 46, 121, 154, 196 |
| ESLint config | `backend/.eslintrc.json`, `frontend/.eslintrc.json` | entire file |
| Test failure | `backend/src/services/task.service.test.ts` | 5 |
| Unused imports | `frontend/src/api/hooks.ts` | 7 |
| Unused imports | `frontend/src/components/KanbanBoard.tsx` | 6 |
| Description limit | `backend/src/middleware/validators.ts` | 16-20, 41-45 |
| Optimistic updates | `frontend/src/api/hooks.ts` | 61-73 |
| confirm() | `frontend/src/components/TaskCard.tsx` | 26 |

---

*Report generated by Claude Opus 4.5 for jbmatlick/clawban*
