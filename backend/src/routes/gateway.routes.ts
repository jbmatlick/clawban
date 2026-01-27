/**
 * Gateway health and control routes
 */

import { Router } from 'express';
import { logger } from '../lib/logger.js';

const router = Router();

// Clawdbot gateway configuration
const GATEWAY_URL = process.env.CLAWDBOT_GATEWAY_URL || 'http://localhost:18789';
const GATEWAY_TOKEN = process.env.CLAWDBOT_GATEWAY_TOKEN || '826cb777240bfb3daaa716cf13c5d65e06abba3775eadd05';

/**
 * Call Clawdbot gateway API
 */
async function callGateway(method: string, params: Record<string, any> = {}) {
  const response = await fetch(`${GATEWAY_URL}/api/v1/call`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GATEWAY_TOKEN}`,
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: Date.now(),
      method,
      params,
    }),
  });

  if (!response.ok) {
    throw new Error(`Gateway HTTP ${response.status}`);
  }

  const data = await response.json() as any;
  
  if (data.error) {
    throw new Error(data.error.message || 'Gateway error');
  }

  return data.result;
}

/**
 * GET /api/gateway/health
 * Check Clawdbot gateway health
 */
router.get('/health', async (req, res) => {
  try {
    const result = await callGateway('health');
    
    const isHealthy = result && result.ok === true;
    
    res.json({
      success: true,
      healthy: isHealthy,
      timestamp: new Date().toISOString(),
      gateway: GATEWAY_URL,
    });
  } catch (error) {
    logger.error('Gateway health check failed', {
      requestId: (req as any).requestId,
      error: error instanceof Error ? error.message : String(error),
    });

    res.json({
      success: true,
      healthy: false,
      timestamp: new Date().toISOString(),
      gateway: GATEWAY_URL,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /api/gateway/restart
 * Restart Clawdbot gateway
 */
router.post('/restart', async (req, res) => {
  try {
    await callGateway('gateway.restart', {
      reason: 'Manual restart via Clawban UI',
      delayMs: 1000,
    });

    logger.info('Gateway restart initiated', {
      requestId: (req as any).requestId,
      userId: (req as any).user?.id,
    });

    res.json({
      success: true,
      message: 'Gateway restart initiated',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Gateway restart failed', {
      requestId: (req as any).requestId,
      error: error instanceof Error ? error.message : String(error),
    });

    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to restart gateway',
    });
  }
});

export default router;
