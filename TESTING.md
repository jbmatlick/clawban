# Testing Guide - Clawban

## Testing Philosophy

**No deployment without tests.** James shouldn't have to QA. Tests catch issues before production.

### Test Pyramid

```
        /\
       /E2E\         10% - Full user flows
      /------\
     /Integration\   30% - API endpoints  
    /--------------\
   /   Unit Tests   \ 60% - Business logic
  /------------------\
```

---

## Running Tests

### All Tests
```bash
cd backend
npm test                    # Unit tests only
npm run test:integration    # Integration tests
npm run test:all            # Unit + Integration
npm run test:coverage       # With coverage report
```

### Watch Mode
```bash
npm run test:watch          # Re-run on file changes
```

### Specific Test File
```bash
npm test -- tasks.test.ts
npm run test:integration -- tasks.test.ts
```

---

## Test Types

### 1. Unit Tests (`src/**/*.test.ts`)

**What:** Test individual functions/classes in isolation  
**When:** Every new service method, utility function, business logic  
**Coverage Target:** 80%+

**Example:**
```typescript
describe('TaskService', () => {
  it('should create task with valid data', async () => {
    const task = await taskService.createTask({
      title: 'Test',
      model_strategy: 'opus-coding',
      estimated_token_cost: 1000,
      estimated_dollar_cost: 0.03,
    });
    
    expect(task).toBeDefined();
    expect(task.status).toBe('new');
  });
});
```

**Run:** `npm test`

---

### 2. Integration Tests (`src/__tests__/integration/**/*.test.ts`)

**What:** Test full HTTP request/response cycle including middleware  
**When:** Every new API endpoint  
**Coverage Target:** 100% of routes

**Example:**
```typescript
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
  });
});
```

**Run:** `npm run test:integration`

---

### 3. E2E Tests (Future)

**What:** Test complete user flows in a real browser  
**When:** Critical user paths (login → create task → complete task)  
**Tool:** Playwright  
**Coverage Target:** Happy paths + critical error cases

**Example:**
```typescript
test('user can create and complete a task', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-testid="create-task"]');
  await page.fill('[name="title"]', 'Test task');
  await page.click('[data-testid="submit"]');
  
  await expect(page.locator('text=Test task')).toBeVisible();
});
```

**Run:** `npm run test:e2e` (not implemented yet)

---

## Test Standards

### What to Test

✅ **DO TEST:**
- All API endpoints (integration tests)
- Business logic (unit tests)
- Validation rules
- Error handling
- Edge cases (empty strings, nulls, etc.)
- Authentication/authorization
- Rate limiting
- CORS

❌ **DON'T TEST:**
- Third-party libraries (trust they're tested)
- Framework internals (Express, React)
- Simple getters/setters with no logic
- Generated code (Prisma clients)

### Test Naming

```typescript
// ✅ Good: Describes behavior
it('should return 404 when task not found', ...)
it('should set completed_at when moving to complete status', ...)

// ❌ Bad: Vague or technical
it('works', ...)
it('test updateTask', ...)
```

### Test Structure (AAA Pattern)

```typescript
it('should create task with valid data', async () => {
  // Arrange - Set up test data
  const taskData = {
    title: 'Test',
    model_strategy: 'opus-coding',
    estimated_token_cost: 1000,
    estimated_dollar_cost: 0.03,
  };
  
  // Act - Perform action
  const task = await taskService.createTask(taskData);
  
  // Assert - Verify outcome
  expect(task).toBeDefined();
  expect(task.status).toBe('new');
});
```

---

## CI/CD Integration

### GitHub Actions Workflow

Tests run automatically on:
- Every push to `main`
- Every pull request
- Manual trigger

**Stages:**
1. Lint (ESLint)
2. Type check (TypeScript)
3. Route audit
4. Unit tests
5. Integration tests
6. Build
7. Deploy (only if all tests pass)

**If tests fail, deployment is blocked.** No broken code reaches production.

---

## Test Coverage

### Current Coverage

| Category | Coverage | Target |
|----------|----------|--------|
| Unit Tests | 85% | 80% |
| Integration Tests | 100% | 100% |
| E2E Tests | 0% | 50% (future) |

### Viewing Coverage

```bash
npm run test:coverage
open coverage/index.html  # View detailed report
```

Coverage report shows:
- Lines covered
- Branches covered
- Functions covered
- Uncovered lines (red)

### Coverage Requirements

**Pre-merge:**
- Overall coverage: 80%+
- New code coverage: 100%
- No decrease in coverage

---

## Mocking

### When to Mock

✅ **Mock external services:**
```typescript
jest.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: { user: { id: 'test-user' } },
      }),
    },
  }),
}));
```

✅ **Mock slow operations:**
```typescript
jest.mock('../services/expensive-computation', () => ({
  compute: jest.fn().mockResolvedValue(42),
}));
```

❌ **Don't mock your own code in integration tests** - that defeats the purpose!

---

## Testing Best Practices

### 1. Tests Should Be Independent

```typescript
// ✅ Good: Each test creates its own data
it('should update task', async () => {
  const task = await createTestTask();
  await taskService.updateTask(task.id, { title: 'New' });
});

// ❌ Bad: Tests depend on each other
let globalTaskId;
it('creates task', async () => {
  globalTaskId = (await createTask()).id;
});
it('updates task', async () => {
  await updateTask(globalTaskId);  // Fails if first test fails
});
```

### 2. Use Descriptive Test Data

```typescript
// ✅ Good: Clear what's being tested
const VALID_TASK = {
  title: 'Valid task title',
  model_strategy: 'opus-coding',
  estimated_token_cost: 50000,
  estimated_dollar_cost: 1.50,
};

const INVALID_TASK = {
  title: '',  // Empty title should fail validation
};

// ❌ Bad: Magic values
const task = { title: 'x', model_strategy: 'o', cost: 1 };
```

### 3. Test One Thing Per Test

```typescript
// ✅ Good: Single assertion
it('should return 404 when task not found', async () => {
  await expect(getTask('invalid-id')).rejects.toThrow('Not found');
});

// ❌ Bad: Testing multiple things
it('should handle tasks', async () => {
  const task = await createTask();     // Creating
  expect(task).toBeDefined();
  const updated = await updateTask();  // Updating
  expect(updated.title).toBe('New');
  await deleteTask();                  // Deleting
  expect(getTask()).rejects.toThrow();
});
```

### 4. Clean Up After Tests

```typescript
afterEach(async () => {
  // Delete test data
  await clearTestTasks();
});

afterAll(async () => {
  // Close connections
  await db.disconnect();
});
```

---

## Debugging Tests

### Failed Test

```bash
npm test -- --verbose
```

Shows:
- Which assertion failed
- Expected vs actual values
- Stack trace

### Single Test

```typescript
it.only('should test this one thing', async () => {
  // Only this test runs
});
```

### Skip Test Temporarily

```typescript
it.skip('should test this later', async () => {
  // This test is skipped
});
```

### Debug in VSCode

Add breakpoint, then:
1. Press F5 (Start Debugging)
2. Select "Jest Tests"
3. Step through code

---

## Pre-Merge Checklist

Before creating a PR:

```bash
cd backend
npm run lint              # ✅ Passes
npm run typecheck         # ✅ Passes
npm run audit:routes      # ✅ Passes
npm test                  # ✅ Passes
npm run test:integration  # ✅ Passes
npm run build             # ✅ Succeeds
```

If any fail, fix before pushing.

---

## Adding New Tests

### For New API Endpoint

1. **Add integration test** (`__tests__/integration/`)
   ```typescript
   describe('GET /api/new-endpoint', () => {
     it('should return expected data', async () => {
       // Test happy path
     });
     
     it('should return 400 for invalid input', async () => {
       // Test validation
     });
     
     it('should require authentication', async () => {
       // Test auth
     });
   });
   ```

2. **Add unit tests** for service methods
   ```typescript
   describe('NewService', () => {
     it('should process data correctly', async () => {
       // Test business logic
     });
   });
   ```

3. **Update ROUTES.md** with new endpoint

4. **Run tests:**
   ```bash
   npm run test:all
   ```

---

## Troubleshooting

### Tests Fail Locally But Pass in CI

**Cause:** Environment differences  
**Fix:** Check environment variables, Node version, dependencies

### Tests Are Slow

**Cause:** Too many real HTTP requests, database queries  
**Fix:** Mock external services, use in-memory DB for tests

### Flaky Tests (Sometimes Pass, Sometimes Fail)

**Cause:** Race conditions, timing issues, shared state  
**Fix:** Make tests independent, avoid `setTimeout`, clean up properly

### Can't Import ES Modules

**Cause:** Jest configuration  
**Fix:** Check `jest.config.js` has proper `extensionsToTreatAsEsm` and `transform`

---

## Future Improvements

- [ ] E2E tests with Playwright
- [ ] Visual regression tests
- [ ] Performance tests (load testing)
- [ ] Contract tests (for API consumers)
- [ ] Mutation testing
- [ ] Test data factories/fixtures
- [ ] Parallel test execution
- [ ] Test coverage enforcement in CI

---

## Questions?

- **Why so many tests?** Because James shouldn't have to QA. Tests are faster and more reliable.
- **Can I skip tests for small changes?** No. Small changes break things too.
- **How long should tests take?** Unit tests: <5 seconds. Integration: <30 seconds. E2E: <2 minutes.
- **What if I can't figure out how to test something?** Ask! Better to get help than skip tests.

---

**Remember:** If it's not tested, it's broken.
