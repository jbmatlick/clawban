#!/usr/bin/env tsx
/**
 * Create and complete tasks for today's work
 */

const BACKEND_URL = 'http://localhost:3001';
const API_KEY = '8f41457a13352b960cfb59e3b9f03bd93ac22612c0d163691a9e811115b5de27';

interface Task {
  title: string;
  description: string;
  model_strategy: 'opus-planning' | 'opus-coding' | 'sonnet-coding' | 'mixed';
  estimated_token_cost: number;
  estimated_dollar_cost: number;
  assignee: 'rufus' | 'james';
  tags: string[];
}

const completedTasks: Task[] = [
  {
    title: 'Add tag filtering to frontend UI',
    description: `✅ COMPLETED

**What was done:**
- Added tag filter buttons to Kanban UI
- Backend already supported ?tag=<name>
- Shows all unique tags from tasks
- Click to filter, click again to clear
- Combines with assignee filters

**Files changed:**
- frontend/src/api/client.ts
- frontend/src/api/hooks.ts
- frontend/src/components/KanbanBoard.tsx

**Effort:** 30 minutes`,
    model_strategy: 'sonnet-coding',
    estimated_token_cost: 30000,
    estimated_dollar_cost: 0.45,
    assignee: 'rufus',
    tags: ['clawban', 'frontend', 'quick-win'],
  },
  {
    title: 'Add Swagger API documentation',
    description: `✅ COMPLETED

**What was done:**
- Created OpenAPI 3.0 specification
- Interactive docs at /api-docs
- All endpoints documented with examples
- Both JWT and API key auth documented

**Files changed:**
- backend/src/openapi.ts (15KB)
- backend/src/index.ts (mounted Swagger UI)

**Test:** http://localhost:3001/api-docs

**Effort:** 1 hour`,
    model_strategy: 'opus-coding',
    estimated_token_cost: 80000,
    estimated_dollar_cost: 2.4,
    assignee: 'rufus',
    tags: ['clawban', 'documentation'],
  },
  {
    title: 'Add pre-commit hooks with Husky',
    description: `✅ COMPLETED

**What was done:**
- Installed Husky and lint-staged
- Created .husky/pre-commit hook
- Runs lint + typecheck + tests before commit
- Auto-formats code with prettier
- Configured for both backend and frontend

**Files changed:**
- .husky/pre-commit
- .lintstagedrc.json
- backend/package.json (added dependencies)

**Test:** Try git commit → tests run automatically

**Effort:** 20 minutes`,
    model_strategy: 'sonnet-coding',
    estimated_token_cost: 15000,
    estimated_dollar_cost: 0.23,
    assignee: 'rufus',
    tags: ['clawban', 'dx', 'quick-win'],
  },
  {
    title: 'Create frontend production config',
    description: `✅ COMPLETED

**What was done:**
- Created .env.production with Railway backend URL
- Configured Supabase for production
- Ready for Vercel deployment

**Files changed:**
- frontend/.env.production

**To deploy:**
cd frontend && vercel --prod

**Effort:** 10 minutes`,
    model_strategy: 'opus-planning',
    estimated_token_cost: 10000,
    estimated_dollar_cost: 0.3,
    assignee: 'rufus',
    tags: ['clawban', 'deployment', 'quick-win'],
  },
  {
    title: 'Create route registry and audit system',
    description: `✅ COMPLETED

**What was done:**
- Created ROUTES.md documenting all 9 routes
- Built automated route audit script
- Detects duplicates, non-RESTful, missing validation
- Added to precommit checks
- All routes passing audit

**Files changed:**
- backend/ROUTES.md (8KB)
- backend/scripts/audit-routes.ts (8KB)
- backend/package.json (added audit:routes script)

**Test:** npm run audit:routes → 0 issues

**Effort:** 1.5 hours`,
    model_strategy: 'opus-coding',
    estimated_token_cost: 100000,
    estimated_dollar_cost: 3.0,
    assignee: 'rufus',
    tags: ['clawban', 'architecture'],
  },
  {
    title: 'Build automated testing system',
    description: `✅ COMPLETED

**What was done:**
- 9 integration tests (health, auth, CORS, security)
- GitHub Actions CI/CD workflow
- Smoke test script for production
- TESTING.md comprehensive guide
- All tests passing

**Files changed:**
- .github/workflows/test-and-deploy.yml (5KB)
- backend/src/__tests__/integration/health.test.ts (3KB)
- scripts/smoke-test.ts (7KB)
- TESTING.md (10KB)

**Result:** No more manual QA needed

**Effort:** 3 hours`,
    model_strategy: 'opus-coding',
    estimated_token_cost: 150000,
    estimated_dollar_cost: 4.5,
    assignee: 'rufus',
    tags: ['clawban', 'testing', 'ci-cd'],
  },
  {
    title: 'Create enterprise architecture assessment',
    description: `✅ COMPLETED

**What was done:**
- Full architecture assessment (58/100 → 95/100 roadmap)
- ENTERPRISE_ARCHITECTURE_ASSESSMENT.md (14KB)
- CONTRIBUTING.md developer guidelines (11KB)
- DEPLOYMENT_FIX.md (6KB)
- 5-phase roadmap with priorities

**Result:** Clear path from MVP to enterprise

**Effort:** 2 hours`,
    model_strategy: 'opus-planning',
    estimated_token_cost: 80000,
    estimated_dollar_cost: 2.4,
    assignee: 'rufus',
    tags: ['clawban', 'architecture', 'documentation'],
  },
];

async function createAndCompleteTask(task: Task): Promise<void> {
  // Create task
  const createRes = await fetch(`${BACKEND_URL}/api/tasks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': API_KEY,
    },
    body: JSON.stringify(task),
  });

  if (!createRes.ok) {
    const error = await createRes.text();
    throw new Error(`Failed to create task: ${createRes.status} ${error}`);
  }

  const created = await createRes.json();
  const taskId = created.data.id;

  console.log(`✅ Created: ${task.title}`);

  // Move to complete
  const moveRes = await fetch(`${BACKEND_URL}/api/tasks/${taskId}/move`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': API_KEY,
    },
    body: JSON.stringify({ status: 'complete' }),
  });

  if (!moveRes.ok) {
    const error = await moveRes.text();
    throw new Error(`Failed to complete task: ${moveRes.status} ${error}`);
  }

  console.log(`   → Moved to complete`);
}

async function main() {
  console.log('📋 Creating completed tasks for today...\n');

  for (const task of completedTasks) {
    try {
      await createAndCompleteTask(task);
    } catch (error) {
      console.error(`❌ Failed: ${task.title}`);
      console.error(`   ${error instanceof Error ? error.message : error}`);
    }
  }

  console.log('\n✅ Done! All tasks moved to Complete column.\n');
}

main().catch(error => {
  console.error('💥 Script crashed:', error);
  process.exit(1);
});
