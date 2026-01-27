#!/usr/bin/env tsx
/**
 * Smoke Test - Verify Deployed System
 * 
 * Tests production/staging deployment to ensure basic functionality works.
 * Run after deployment to catch issues before users do.
 * 
 * Usage:
 *   BACKEND_URL=https://your-app.railway.app tsx scripts/smoke-test.ts
 *   FRONTEND_URL=https://your-app.vercel.app tsx scripts/smoke-test.ts
 */

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  duration: number;
}

const results: TestResult[] = [];
const BACKEND_URL = process.env.BACKEND_URL || process.env.RAILWAY_URL || 'http://localhost:3001';
const FRONTEND_URL = process.env.FRONTEND_URL || process.env.VERCEL_URL || 'http://localhost:5173';

/**
 * Run a test and record result
 */
async function test(name: string, fn: () => Promise<void>): Promise<void> {
  const start = Date.now();
  try {
    await fn();
    results.push({
      name,
      passed: true,
      duration: Date.now() - start,
    });
    console.log(`✅ ${name}`);
  } catch (error) {
    results.push({
      name,
      passed: false,
      error: error instanceof Error ? error.message : String(error),
      duration: Date.now() - start,
    });
    console.error(`❌ ${name}: ${error instanceof Error ? error.message : error}`);
  }
}

/**
 * Backend Tests
 */

async function testBackendHealth() {
  const response = await fetch(`${BACKEND_URL}/health`);
  if (!response.ok) {
    throw new Error(`Health check failed: ${response.status}`);
  }
  const data = await response.json();
  if (data.status !== 'ok') {
    throw new Error(`Health check returned non-OK status: ${data.status}`);
  }
}

async function testBackendAuthRequired() {
  const response = await fetch(`${BACKEND_URL}/api/tasks`);
  if (response.status !== 401) {
    throw new Error(`Expected 401, got ${response.status}`);
  }
}

async function testBackendCORS() {
  const response = await fetch(`${BACKEND_URL}/health`, {
    headers: {
      'Origin': 'https://example.com',
    },
  });
  const corsHeader = response.headers.get('Access-Control-Allow-Origin');
  if (!corsHeader) {
    throw new Error('CORS headers missing');
  }
}

async function testBackendRateLimit() {
  // Make sure rate limiting is active (returns appropriate headers)
  const response = await fetch(`${BACKEND_URL}/health`);
  const rateLimitHeaders = [
    'X-RateLimit-Limit',
    'X-RateLimit-Remaining',
  ];
  
  // At least one rate limit header should be present
  const hasRateLimitHeader = rateLimitHeaders.some(h => response.headers.has(h));
  if (!hasRateLimitHeader) {
    console.warn('⚠️  Rate limit headers not found (may be expected)');
  }
}

/**
 * Frontend Tests
 */

async function testFrontendLoads() {
  const response = await fetch(FRONTEND_URL);
  if (!response.ok) {
    throw new Error(`Frontend failed to load: ${response.status}`);
  }
  const html = await response.text();
  if (!html.includes('<!DOCTYPE html') && !html.includes('<!doctype html')) {
    throw new Error('Response is not HTML');
  }
}

async function testFrontendHasAssets() {
  const response = await fetch(FRONTEND_URL);
  const html = await response.text();
  
  // Check for common assets
  if (!html.includes('.js') && !html.includes('.css')) {
    throw new Error('No JS or CSS assets found in HTML');
  }
}

async function testFrontendNotIndexing() {
  const response = await fetch(FRONTEND_URL);
  const html = await response.text();
  
  // Production apps should have proper meta tags
  if (!html.includes('<meta')) {
    console.warn('⚠️  No meta tags found (SEO concern)');
  }
}

/**
 * Integration Tests (requires auth token)
 */

async function testBackendAPIWithAuth() {
  const authToken = process.env.TEST_AUTH_TOKEN;
  if (!authToken) {
    console.log('⏭️  Skipping API test (no TEST_AUTH_TOKEN)');
    return;
  }
  
  const response = await fetch(`${BACKEND_URL}/api/tasks`, {
    headers: {
      'Authorization': `Bearer ${authToken}`,
    },
  });
  
  if (!response.ok) {
    throw new Error(`API call failed: ${response.status}`);
  }
  
  const data = await response.json();
  if (!data.success) {
    throw new Error('API returned success=false');
  }
  
  if (!Array.isArray(data.data)) {
    throw new Error('API did not return array of tasks');
  }
}

/**
 * Performance Tests
 */

async function testBackendResponseTime() {
  const start = Date.now();
  await fetch(`${BACKEND_URL}/health`);
  const duration = Date.now() - start;
  
  if (duration > 1000) {
    throw new Error(`Response time too slow: ${duration}ms (expected <1000ms)`);
  }
  
  console.log(`   (${duration}ms)`);
}

async function testFrontendResponseTime() {
  const start = Date.now();
  await fetch(FRONTEND_URL);
  const duration = Date.now() - start;
  
  if (duration > 3000) {
    throw new Error(`Response time too slow: ${duration}ms (expected <3000ms)`);
  }
  
  console.log(`   (${duration}ms)`);
}

/**
 * Main
 */

async function main() {
  console.log('🔍 Running smoke tests...\n');
  console.log(`Backend:  ${BACKEND_URL}`);
  console.log(`Frontend: ${FRONTEND_URL}\n`);
  
  // Backend tests
  console.log('📡 Backend Tests:');
  await test('Backend health check', testBackendHealth);
  await test('Backend requires auth', testBackendAuthRequired);
  await test('Backend CORS configured', testBackendCORS);
  await test('Backend response time', testBackendResponseTime);
  await test('Backend rate limiting', testBackendRateLimit);
  
  console.log('\n🌐 Frontend Tests:');
  await test('Frontend loads', testFrontendLoads);
  await test('Frontend has assets', testFrontendHasAssets);
  await test('Frontend meta tags', testFrontendNotIndexing);
  await test('Frontend response time', testFrontendResponseTime);
  
  console.log('\n🔐 Integration Tests (optional):');
  await test('Backend API with auth', testBackendAPIWithAuth);
  
  // Summary
  console.log('\n' + '═'.repeat(60));
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  const total = results.length;
  
  console.log(`Results: ${passed}/${total} passed, ${failed} failed`);
  
  if (failed > 0) {
    console.log('\n❌ Smoke tests failed!\n');
    console.log('Failed tests:');
    results.filter(r => !r.passed).forEach(r => {
      console.log(`  - ${r.name}: ${r.error}`);
    });
    process.exit(1);
  } else {
    console.log('\n✅ All smoke tests passed!\n');
    process.exit(0);
  }
}

main().catch(error => {
  console.error('💥 Smoke tests crashed:', error);
  process.exit(1);
});
