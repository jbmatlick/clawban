#!/usr/bin/env tsx
/**
 * Create Clawban backlog as tasks in Clawban itself
 * Tags all with "clawban" project tag
 */

interface Task {
  title: string;
  description: string;
  model_strategy: 'opus-planning' | 'opus-coding' | 'sonnet-coding' | 'mixed';
  estimated_token_cost: number;
  estimated_dollar_cost: number;
  assignee: 'rufus' | 'james';
  tags: string[];
}

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';
const AUTH_TOKEN = process.env.CLAWBAN_AUTH_TOKEN || '';

const backlog: Task[] = [
  // P0 - Critical (High payoff, low effort)
  {
    title: 'Complete PostgreSQL migration',
    description: `**Why:** Still using JSON files, data lost on restart
    
**What to do:**
1. Wait for Supabase maintenance to complete
2. Run \`npx prisma migrate deploy\`
3. Refactor services to use Prisma ORM
4. Delete old JSON file storage code
5. Update tests for Prisma
6. Deploy to Railway
7. Verify persistence

**Acceptance:** Tasks survive Railway restarts

**Blocked by:** Supabase maintenance`,
    model_strategy: 'opus-coding',
    estimated_token_cost: 100000,
    estimated_dollar_cost: 3.0,
    assignee: 'rufus',
    tags: ['clawban', 'database', 'p0'],
  },
  
  {
    title: 'Set up GitHub Actions CI/CD',
    description: `**Why:** Tests exist but don't run automatically
    
**What to do:**
1. Add GitHub secrets (RAILWAY_TOKEN, VERCEL_TOKEN, etc.)
2. Push to main branch
3. Verify workflow runs
4. Test deployment blocking on test failure
5. Add Telegram notifications

**Acceptance:** Push to main → tests run → auto-deploy if passing

**File:** .github/workflows/test-and-deploy.yml (already created)`,
    model_strategy: 'opus-planning',
    estimated_token_cost: 20000,
    estimated_dollar_cost: 0.6,
    assignee: 'james',
    tags: ['clawban', 'ci-cd', 'p0'],
  },
  
  // P1 - High Priority Quick Wins
  {
    title: 'Add tag filtering to frontend',
    description: `**Why:** Can't filter tasks by project/category
    
**What to do:**
1. Add tag filter buttons to Kanban UI
2. Update API client to pass \`?tag=clawban\` param
3. Backend already supports it (\`GET /api/tasks?tag=<name>\`)
4. Style like assignee filter buttons
5. Show active tag highlight

**Acceptance:** Click tag → only those tasks show

**Effort:** 30 minutes`,
    model_strategy: 'sonnet-coding',
    estimated_token_cost: 30000,
    estimated_dollar_cost: 0.45,
    assignee: 'rufus',
    tags: ['clawban', 'frontend', 'p1', 'quick-win'],
  },
  
  {
    title: 'Add pre-commit hooks with Husky',
    description: `**Why:** Tests exist but aren't enforced
    
**What to do:**
1. \`npm install --save-dev husky lint-staged\`
2. \`npx husky init\`
3. Add pre-commit hook: \`npm run precommit\`
4. Configure lint-staged for TS/JSON files
5. Test: Try to commit broken code → blocked

**Acceptance:** Can't commit code that fails tests

**Effort:** 20 minutes`,
    model_strategy: 'sonnet-coding',
    estimated_token_cost: 15000,
    estimated_dollar_cost: 0.23,
    assignee: 'rufus',
    tags: ['clawban', 'dx', 'p1', 'quick-win'],
  },
  
  {
    title: 'Add OpenAPI/Swagger docs',
    description: `**Why:** No interactive API documentation
    
**What to do:**
1. Generate OpenAPI spec from contracts
2. Add swagger-ui-express (already installed)
3. Mount at \`/api-docs\`
4. Add examples for each endpoint
5. Include authentication flows

**Acceptance:** Visit /api-docs → see interactive API docs

**Effort:** 2 hours`,
    model_strategy: 'opus-coding',
    estimated_token_cost: 80000,
    estimated_dollar_cost: 2.4,
    assignee: 'rufus',
    tags: ['clawban', 'documentation', 'p1'],
  },
  
  // P2 - Medium Priority
  {
    title: 'Add Prometheus metrics endpoint',
    description: `**Why:** No observability into system performance
    
**What to do:**
1. \`npm install prom-client\`
2. Create metrics: http_request_duration, task_count_by_status, etc.
3. Add \`GET /metrics\` endpoint
4. Instrument request middleware
5. Add to documentation

**Acceptance:** Prometheus can scrape /metrics

**Effort:** 2 hours`,
    model_strategy: 'opus-coding',
    estimated_token_cost: 60000,
    estimated_dollar_cost: 1.8,
    assignee: 'rufus',
    tags: ['clawban', 'observability', 'p2'],
  },
  
  {
    title: 'Add LLM usage tracking API',
    description: `**Why:** No way to log actual token usage from task execution
    
**What to do:**
1. POST /api/tasks/:id/llm-usage endpoint
2. Accept: model, tokens_in, tokens_out, cost
3. Store in database (schema already designed)
4. Display in task details UI
5. Add aggregate cost dashboard

**Acceptance:** Rufus can log token usage after completing tasks

**Effort:** 3 hours`,
    model_strategy: 'opus-coding',
    estimated_token_cost: 80000,
    estimated_dollar_cost: 2.4,
    assignee: 'rufus',
    tags: ['clawban', 'feature', 'p2'],
  },
  
  {
    title: 'Deploy frontend to Vercel',
    description: `**Why:** Frontend isn't deployed anywhere
    
**What to do:**
1. Create production .env with VITE_API_URL, etc.
2. \`vercel --prod\`
3. Configure custom domain (optional)
4. Test authentication works
5. Update DEPLOYMENT.md

**Acceptance:** Can access Clawban UI at public URL

**Effort:** 30 minutes`,
    model_strategy: 'opus-planning',
    estimated_token_cost: 20000,
    estimated_dollar_cost: 0.6,
    assignee: 'rufus',
    tags: ['clawban', 'deployment', 'p2', 'quick-win'],
  },
  
  // P3 - Nice to Have
  {
    title: 'Add E2E tests with Playwright',
    description: `**Why:** Integration tests don't cover full user flows
    
**What to do:**
1. \`npm install -D @playwright/test\`
2. Create tests/e2e/ folder
3. Test: Login → Create task → Move to complete
4. Add to CI/CD pipeline
5. Run on deployment

**Acceptance:** E2E tests catch UI bugs

**Effort:** 4 hours`,
    model_strategy: 'opus-coding',
    estimated_token_cost: 100000,
    estimated_dollar_cost: 3.0,
    assignee: 'rufus',
    tags: ['clawban', 'testing', 'p3'],
  },
  
  {
    title: 'Add daily digest Telegram bot',
    description: `**Why:** James wants summary of tasks each morning
    
**What to do:**
1. Create cron job for 6 AM HST daily
2. Query API for task counts by assignee
3. Format as markdown message
4. Send via Telegram
5. Add "skip weekends" option

**Acceptance:** James gets daily task summary at 6 AM

**Effort:** 2 hours`,
    model_strategy: 'sonnet-coding',
    estimated_token_cost: 40000,
    estimated_dollar_cost: 0.6,
    assignee: 'rufus',
    tags: ['clawban', 'automation', 'p3'],
  },
  
  {
    title: 'Add task comments/activity log',
    description: `**Why:** No way to discuss or track task changes
    
**What to do:**
1. Add comments table to Prisma schema
2. POST /api/tasks/:id/comments
3. GET /api/tasks/:id/comments
4. Add comment UI to task modal
5. Track status changes automatically

**Acceptance:** Can comment on tasks, see activity history

**Effort:** 4 hours`,
    model_strategy: 'opus-coding',
    estimated_token_cost: 120000,
    estimated_dollar_cost: 3.6,
    assignee: 'rufus',
    tags: ['clawban', 'feature', 'p3'],
  },
  
  {
    title: 'Add search and advanced filtering',
    description: `**Why:** Hard to find specific tasks
    
**What to do:**
1. Add search input to Kanban UI
2. Backend: Full-text search on title + description
3. Filters: date range, cost range, model strategy
4. Combine multiple filters (AND/OR logic)
5. Save filter presets

**Acceptance:** Can search for tasks and combine filters

**Effort:** 5 hours`,
    model_strategy: 'opus-coding',
    estimated_token_cost: 150000,
    estimated_dollar_cost: 4.5,
    assignee: 'rufus',
    tags: ['clawban', 'feature', 'p3'],
  },
  
  // Documentation
  {
    title: 'Write user guide',
    description: `**Why:** No documentation for how to use Clawban
    
**What to do:**
1. Create USER_GUIDE.md
2. How to create tasks
3. How to assign and filter
4. Best practices for task writing
5. Integration with AI agents

**Acceptance:** New user can onboard from guide alone

**Effort:** 2 hours`,
    model_strategy: 'sonnet-coding',
    estimated_token_cost: 40000,
    estimated_dollar_cost: 0.6,
    assignee: 'rufus',
    tags: ['clawban', 'documentation', 'p3'],
  },
];

async function createTask(task: Task): Promise<void> {
  const response = await fetch(`${BACKEND_URL}/api/tasks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': AUTH_TOKEN,
    },
    body: JSON.stringify(task),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create task "${task.title}": ${response.status} ${error}`);
  }

  const result = await response.json();
  console.log(`✅ Created: ${task.title} (${task.tags.join(', ')})`);
  return result.data;
}

async function main() {
  console.log('📋 Creating Clawban backlog...\n');
  
  if (!AUTH_TOKEN) {
    console.error('❌ Error: CLAWBAN_AUTH_TOKEN environment variable required');
    console.log('\nGet a token from Supabase:');
    console.log('1. Go to https://ljjqlehrxxxgdcsfvzei.supabase.co');
    console.log('2. Authentication → Users → Create user');
    console.log('3. Copy the JWT token');
    console.log('4. export CLAWBAN_AUTH_TOKEN=<token>');
    process.exit(1);
  }
  
  let created = 0;
  let failed = 0;
  
  for (const task of backlog) {
    try {
      await createTask(task);
      created++;
    } catch (error) {
      console.error(`❌ Failed: ${task.title}`);
      console.error(`   ${error instanceof Error ? error.message : error}`);
      failed++;
    }
  }
  
  console.log(`\n${'═'.repeat(60)}`);
  console.log(`Results: ${created} created, ${failed} failed`);
  console.log(`${'═'.repeat(60)}\n`);
  
  if (failed > 0) {
    console.log('⚠️  Some tasks failed to create. Check errors above.');
    process.exit(1);
  } else {
    console.log('✅ Backlog created successfully!');
    console.log(`\nView at: http://localhost:5173 (or your deployed URL)`);
    console.log('Filter by tag: clawban\n');
    process.exit(0);
  }
}

main().catch(error => {
  console.error('💥 Script crashed:', error);
  process.exit(1);
});
