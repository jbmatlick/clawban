/**
 * Basic integration tests for public endpoints
 * These don't require authentication and test the app is working.
 */

import request from 'supertest';
import app from '../../index.js';

describe('Health Check', () => {
  it('GET /health should return 200 OK', async () => {
    const response = await request(app)
      .get('/health')
      .expect(200);

    expect(response.body).toHaveProperty('status', 'ok');
    expect(response.body).toHaveProperty('timestamp');
  });

  it('GET /health should return valid timestamp', async () => {
    const response = await request(app)
      .get('/health')
      .expect(200);

    const timestamp = new Date(response.body.timestamp as string);
    expect(timestamp.toString()).not.toBe('Invalid Date');
    
    // Should be recent (within last minute)
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    expect(diff).toBeLessThan(60000);
  });
});

describe('404 Handling', () => {
  it('should return 404 for unknown routes', async () => {
    const response = await request(app)
      .get('/does-not-exist')
      .expect(404);

    expect(response.body.success as boolean).toBe(false);
    expect(response.body.error as string).toContain('Not found');
  });
});

describe('Authentication', () => {
  it('GET /api/tasks should require auth token', async () => {
    await request(app)
      .get('/api/tasks')
      .expect(401);
  });

  it('POST /api/tasks should require auth token', async () => {
    await request(app)
      .post('/api/tasks')
      .send({
        title: 'Test task',
        model_strategy: 'opus-coding',
        estimated_token_cost: 1000,
        estimated_dollar_cost: 0.03,
      })
      .expect(401);
  });

  it('GET /api/tags should require auth token', async () => {
    await request(app)
      .get('/api/tags')
      .expect(401);
  });
});

describe('CORS', () => {
  it('should include CORS headers', async () => {
    const response = await request(app)
      .get('/health')
      .set('Origin', 'http://localhost:5173');

    expect(response.headers['access-control-allow-origin']).toBeDefined();
  });
});

describe('Security Headers', () => {
  it('should include security headers from Helmet', async () => {
    const response = await request(app)
      .get('/health');

    // Helmet adds various security headers
    expect(response.headers['x-dns-prefetch-control']).toBeDefined();
    expect(response.headers['x-frame-options']).toBeDefined();
  });
});

describe('Rate Limiting', () => {
  it('should include rate limit headers', async () => {
    const response = await request(app)
      .get('/health');

    // express-rate-limit adds these headers
    expect(
      response.headers['ratelimit-limit'] ||
      response.headers['x-ratelimit-limit']
    ).toBeDefined();
  });
});
