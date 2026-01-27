# Contributing to Clawban

Thank you for contributing to Clawban! This document outlines the standards and processes we follow to maintain enterprise-grade code quality.

---

## Core Principles

1. **Routes are precious** - Every new route must be justified
2. **Documentation is code** - Update docs WITH your code changes
3. **Type safety is non-negotiable** - No `any` types
4. **Tests are mandatory** - No PR without tests
5. **Standards over speed** - Quality > quick fixes

---

## Before You Start

1. Read [ENTERPRISE_ARCHITECTURE_ASSESSMENT.md](ENTERPRISE_ARCHITECTURE_ASSESSMENT.md)
2. Check [backend/ROUTES.md](backend/ROUTES.md) for existing routes
3. Search issues/PRs for related work
4. Ask in discussions if unsure

---

## Development Setup

### Prerequisites
- Node.js 18+
- npm 9+
- PostgreSQL (via Supabase)

### Installation
```bash
# Clone and install
git clone https://github.com/jbmatlick/clawban.git
cd clawban

# Backend
cd backend
npm install
cp .env.example .env  # Configure environment

# Frontend
cd ../frontend
npm install
cp .env.example .env  # Configure environment
```

### Run Locally
```bash
# Terminal 1 - Backend (port 3001)
cd backend
npm run dev

# Terminal 2 - Frontend (port 5173)
cd frontend
npm run dev
```

### Run Tests
```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test

# Route audit
cd backend
npm run audit:routes
```

---

## Code Standards

### TypeScript
- **Strict mode enabled** - No exceptions
- **No `any` types** - Use `unknown` and type guards
- **Explicit return types** - For all functions
- **Interfaces over types** - For object shapes

**Good:**
```typescript
interface Task {
  id: string;
  title: string;
  status: TaskStatus;
}

function getTask(id: string): Promise<Task | null> {
  // ...
}
```

**Bad:**
```typescript
// ❌ any type
function getTask(id: any): any {
  // ...
}

// ❌ implicit return type
function getTask(id: string) {
  // ...
}
```

### RESTful API Design
- **Use HTTP verbs correctly**
  - GET: Read (safe, idempotent)
  - POST: Create or non-idempotent actions
  - PATCH: Partial update
  - DELETE: Remove
- **Plural nouns for collections**: `/api/tasks`
- **Singular for single resource**: `/api/tasks/:id`
- **Actions as nested paths**: `/api/tasks/:id/move`
- **No verbs in URLs**: ❌ `/api/getTasks`, ✅ `GET /api/tasks`

### Validation
- **All inputs validated** - Use `express-validator`
- **Fail fast** - Return 400 on validation error
- **Meaningful error messages** - Help users fix their input

```typescript
export const createTaskValidators = [
  body('title')
    .isString()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be 1-200 characters'),
  body('model_strategy')
    .isIn(['opus-planning', 'opus-coding', 'sonnet-coding', 'mixed'])
    .withMessage('Invalid model strategy'),
];
```

### Error Handling
- **Consistent response shape**:
  ```json
  {
    "success": false,
    "error": "Error message",
    "details": { ... }  // Optional
  }
  ```
- **Appropriate status codes**:
  - 400: Bad request (validation)
  - 401: Unauthorized
  - 403: Forbidden
  - 404: Not found
  - 500: Internal server error
- **Log all errors** with context

---

## Pre-Merge Checklist

### For All Changes
- [ ] Code compiles (`npm run build`)
- [ ] Linting passes (`npm run lint`)
- [ ] Type checking passes (`npm run typecheck`)
- [ ] All tests pass (`npm test`)
- [ ] No console.log statements (use logger)
- [ ] Documentation updated
- [ ] Git commit messages are meaningful

### For New Routes
- [ ] Checked [backend/ROUTES.md](backend/ROUTES.md) for duplicates
- [ ] Route follows RESTful conventions
- [ ] Added to ROUTES.md with full documentation
- [ ] Added validation middleware
- [ ] Route audit passes (`npm run audit:routes`)
- [ ] Controller method exists
- [ ] Service method exists
- [ ] Unit test for service method
- [ ] Integration test for route
- [ ] OpenAPI spec updated (when available)

### For Database Changes
- [ ] Prisma schema updated
- [ ] Migration created (`npx prisma migrate dev`)
- [ ] Migration tested locally
- [ ] Seed data updated if needed
- [ ] Documentation updated

### For Frontend Changes
- [ ] Component is typed (no `any`)
- [ ] Follows design system
- [ ] Responsive (mobile-friendly)
- [ ] Accessibility checked (WCAG AA)
- [ ] Loading states handled
- [ ] Error states handled
- [ ] Component tests added

---

## Pull Request Process

### 1. Create Feature Branch
```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

**Branch naming:**
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation only
- `refactor/` - Code refactoring
- `test/` - Adding tests
- `chore/` - Maintenance tasks

### 2. Make Changes
- Follow code standards above
- Write tests as you code
- Commit frequently with clear messages

**Commit message format:**
```
type(scope): Short description

Longer description if needed.

Closes #123
```

**Types:** feat, fix, docs, refactor, test, chore  
**Example:** `feat(tasks): Add tag filtering to task list API`

### 3. Run Pre-Merge Checks
```bash
cd backend
npm run precommit
```

This runs:
1. Linting
2. Type checking
3. Route audit
4. Tests

**Fix any issues before proceeding.**

### 4. Update Documentation
- [ ] README.md (if setup changed)
- [ ] backend/ROUTES.md (if routes changed)
- [ ] API docs (if endpoints changed)
- [ ] CHANGELOG.md (for significant changes)

### 5. Create Pull Request
- **Title:** Clear, descriptive (e.g., "Add tag filtering to task API")
- **Description:**
  - What changed and why
  - How to test
  - Screenshots (for UI changes)
  - Breaking changes (if any)
  - Related issues/PRs

**PR Template:**
```markdown
## What
Brief description of changes

## Why
Reason for the change

## How to Test
1. Step-by-step testing instructions
2. Expected results

## Screenshots (if applicable)
[Add screenshots]

## Checklist
- [ ] Tests pass
- [ ] Route audit passes
- [ ] Documentation updated
- [ ] No breaking changes (or documented)

Closes #123
```

### 6. Code Review
- Address reviewer feedback promptly
- Be open to suggestions
- Explain your reasoning when needed
- Update PR as requested

### 7. Merge
- **Squash and merge** for clean history
- Delete branch after merge
- Celebrate! 🎉

---

## Testing Guidelines

### Backend Tests

**Unit Tests** (Services)
```typescript
describe('TaskService', () => {
  describe('createTask', () => {
    it('should create task with valid data', async () => {
      const task = await taskService.createTask({
        title: 'Test task',
        model_strategy: 'opus-coding',
        estimated_token_cost: 1000,
        estimated_dollar_cost: 0.03,
      });
      
      expect(task).toBeDefined();
      expect(task.title).toBe('Test task');
      expect(task.status).toBe('new');
    });
    
    it('should reject invalid model strategy', async () => {
      await expect(
        taskService.createTask({
          title: 'Test',
          model_strategy: 'invalid' as any,
          estimated_token_cost: 1000,
          estimated_dollar_cost: 0.03,
        })
      ).rejects.toThrow();
    });
  });
});
```

**Integration Tests** (Routes)
```typescript
import request from 'supertest';
import app from '../index';

describe('POST /api/tasks', () => {
  it('should create task and return 201', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .set('Authorization', 'Bearer test-token')
      .send({
        title: 'Test task',
        model_strategy: 'opus-coding',
        estimated_token_cost: 1000,
        estimated_dollar_cost: 0.03,
      })
      .expect(201);
    
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe('Test task');
  });
  
  it('should return 400 for invalid data', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .set('Authorization', 'Bearer test-token')
      .send({ title: '' })  // Invalid
      .expect(400);
    
    expect(res.body.success).toBe(false);
    expect(res.body.error).toContain('validation');
  });
});
```

### Frontend Tests

**Component Tests**
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { TaskCard } from './TaskCard';

describe('TaskCard', () => {
  const mockTask = {
    id: '1',
    title: 'Test task',
    status: 'new',
    // ...
  };
  
  it('should render task title', () => {
    render(<TaskCard task={mockTask} />);
    expect(screen.getByText('Test task')).toBeInTheDocument();
  });
  
  it('should call onEdit when edit button clicked', () => {
    const onEdit = jest.fn();
    render(<TaskCard task={mockTask} onEdit={onEdit} />);
    
    fireEvent.click(screen.getByLabelText('Edit task'));
    expect(onEdit).toHaveBeenCalledWith(mockTask.id);
  });
});
```

---

## Route Management Process

### Before Adding a New Route

1. **Search for existing routes**
   ```bash
   cd backend
   npm run audit:routes
   ```

2. **Check ROUTES.md**
   - Is there an existing route that does this?
   - Can an existing route be extended instead?

3. **Ask yourself:**
   - Is this RESTful?
   - Is this the right HTTP verb?
   - Should this be a query param instead?
   - Is the naming clear and consistent?

### When Adding a New Route

1. **Design the route**
   ```
   Method: GET
   Path: /api/tasks/:id/comments
   Purpose: List comments for a task
   Auth: Required
   Validation: idParamValidator
   ```

2. **Update ROUTES.md**
   - Add full documentation
   - Include request/response examples
   - Document validation rules

3. **Implement**
   - Route → Controller → Service
   - Add validation middleware
   - Add tests

4. **Verify**
   ```bash
   npm run audit:routes
   ```

---

## Common Pitfalls to Avoid

### ❌ Don't Do This

**Non-RESTful routes:**
```typescript
router.post('/api/getTasks');           // ❌ Use GET
router.get('/api/createTask');          // ❌ Use POST
router.post('/api/tasks/delete/:id');   // ❌ Use DELETE
```

**Missing validation:**
```typescript
router.post('/', taskController.create); // ❌ Add validators
```

**Using `any`:**
```typescript
function handle(req: any, res: any) {   // ❌ Type it properly
```

**Duplicate routes:**
```typescript
router.get('/tasks', ...);              // Already exists!
```

**Hardcoded values:**
```typescript
const API_KEY = 'abc123';               // ❌ Use env vars
```

### ✅ Do This Instead

**RESTful routes:**
```typescript
router.get('/api/tasks', validators, controller.list);
router.post('/api/tasks', validators, controller.create);
router.patch('/api/tasks/:id', validators, controller.update);
router.delete('/api/tasks/:id', validators, controller.delete);
```

**Proper types:**
```typescript
function handle(req: Request, res: Response): void {
```

**Environment config:**
```typescript
const API_KEY = process.env.API_KEY;
if (!API_KEY) throw new Error('API_KEY not set');
```

---

## Getting Help

- **Questions?** Open a discussion
- **Bug?** Open an issue with reproduction steps
- **Feature idea?** Open an issue for discussion first
- **Stuck?** Tag @jbmatlick in a comment

---

## License

By contributing, you agree your code will be licensed under MIT.

---

**Remember:** Quality over speed. It's better to take an extra hour to do it right than to create technical debt that costs days to fix later.

Happy coding! 🚀
