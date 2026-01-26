/**
 * Authentication middleware using Supabase JWT
 */

import { Request, Response, NextFunction } from 'express';
import { supabase, isAuthEnabled } from '../lib/supabase.js';

// Type for authenticated user
export interface AuthUser {
  id: string;
  email?: string;
}

// Extend Express Request via module augmentation
declare module 'express-serve-static-core' {
  interface Request {
    user?: AuthUser;
    requestId?: string;
  }
}

/**
 * Extract Bearer token from Authorization header
 */
function extractToken(authHeader: string | undefined): string | null {
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.slice(7);
}

/**
 * Middleware to verify Supabase JWT and attach user to request
 */
export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  // Skip auth if not configured (development mode)
  if (!isAuthEnabled || !supabase) {
    req.user = { id: 'dev-user', email: 'dev@localhost' };
    next();
    return;
  }

  const token = extractToken(req.headers.authorization);

  if (!token) {
    res.status(401).json({
      success: false,
      error: 'Missing authorization token',
    });
    return;
  }

  try {
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      res.status(401).json({
        success: false,
        error: 'Invalid or expired token',
      });
      return;
    }

    req.user = {
      id: data.user.id,
      email: data.user.email,
    };

    next();
  } catch (err) {
    console.error('Auth error:', err);
    res.status(401).json({
      success: false,
      error: 'Authentication failed',
    });
  }
}
