/**
 * Clawban Backend API
 * Professional task management for AI agents
 */

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { nanoid } from 'nanoid';
import taskRoutes from './routes/task.routes.js';
import gatewayRoutes from './routes/gateway.routes.js';
import { requireAuth } from './middleware/api-key-auth.js';
import { logger } from './lib/logger.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Trust Railway proxy for rate limiting
app.set('trust proxy', 1);

// Security: Helmet for HTTP headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// Security: Rate limiting (100 requests per 15 minutes)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    error: 'Too many requests, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// CORS configuration
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Security: Request size limits
app.use(express.json({ limit: '1mb' }));

// Request ID and logging middleware
app.use((req, res, next) => {
  const requestId = (req.headers['x-request-id'] as string) || nanoid();
  req.requestId = requestId;
  res.setHeader('X-Request-ID', requestId);

  const startTime = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    logger.info('Request completed', {
      requestId,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      userId: (req as any).user?.id,
      ip: req.ip,
    });
  });

  next();
});

// Health check (public - no auth required)
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Protected API routes
app.use('/api/tasks', requireAuth, taskRoutes);
app.use('/api/gateway', requireAuth, gatewayRoutes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: 'Not found',
  });
});

// Error handler
app.use((err: Error, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error('Unhandled error', {
    requestId: (req as any).requestId,
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });
  res.status(500).json({
    success: false,
    error: 'Internal server error',
  });
});

// Start server
app.listen(PORT, () => {
  logger.info('Clawban API started', {
    port: PORT,
    nodeEnv: process.env.NODE_ENV || 'development',
    healthCheck: `http://localhost:${PORT}/health`,
    endpoints: `http://localhost:${PORT}/api/tasks`,
  });
});

export default app;
