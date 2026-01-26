/**
 * API key authentication middleware for AI agents
 */

import { Request, Response, NextFunction } from 'express';
import { logger } from '../lib/logger.js';

// Agent user type for API key auth
export interface AgentUser {
  id: string;
  type: 'agent';
  name: string;
}

// Extend Express Request
declare module 'express-serve-static-core' {
  interface Request {
    agent?: AgentUser;
  }
}

/**
 * Extract API key from X-API-Key header
 */
function extractApiKey(req: Request): string | null {
  const header = req.headers['x-api-key'];
  if (typeof header === 'string') {
    return header;
  }
  return null;
}

/**
 * Middleware to verify API key for agent access
 * Checks X-API-Key header against AGENT_API_KEY env var
 */
export async function requireApiKey(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const apiKey = extractApiKey(req);
  const validApiKey = process.env.AGENT_API_KEY;

  if (!validApiKey) {
    logger.warn('API key auth attempted but AGENT_API_KEY not configured');
    res.status(500).json({
      success: false,
      error: 'API key authentication not configured',
    });
    return;
  }

  if (!apiKey) {
    res.status(401).json({
      success: false,
      error: 'Missing API key (X-API-Key header required)',
    });
    return;
  }

  if (apiKey !== validApiKey) {
    logger.warn('Invalid API key attempt', {
      requestId: req.requestId,
      ip: req.ip,
    });
    res.status(401).json({
      success: false,
      error: 'Invalid API key',
    });
    return;
  }

  // Attach agent user to request
  req.agent = {
    id: 'rufus',
    type: 'agent',
    name: 'Rufus',
  };

  logger.info('Agent authenticated', {
    requestId: req.requestId,
    agentId: req.agent.id,
  });

  next();
}

/**
 * Flexible auth middleware - accepts either JWT (Supabase) or API key
 * Used on routes that both humans and agents can access
 */
export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  // Check for API key first
  const apiKey = extractApiKey(req);
  if (apiKey) {
    return requireApiKey(req, res, next);
  }

  // Fall back to JWT auth (import from auth.ts)
  const { requireAuth: requireJWT } = await import('./auth.js');
  return requireJWT(req, res, next);
}
