import { Router } from 'express';
import tiktokRoutes from './tiktokRoutes.js';
import downloadRoutes from './downloadRoutes.js';
import { rateLimitMiddleware } from '../utils/rateLimiter.js';

const router = Router();

// Apply rate limiting across all API endpoints
router.use(rateLimitMiddleware);

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'SnapTok API',
    timestamp: new Date().toISOString(),
  });
});

// TikTok endpoints
router.use('/tiktok', tiktokRoutes);

// Download streaming endpoint
router.use('/download', downloadRoutes);

// Unmatched API routes fallback
router.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `API route ${req.originalUrl} not found`,
  });
});

export default router;
