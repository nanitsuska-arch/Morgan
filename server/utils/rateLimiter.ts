import type { Request, Response, NextFunction } from 'express';

interface RateLimitRecord {
  timestamps: number[];
}

const windowMs = 60 * 1000; // 1 minute
const maxRequestsPerWindow = 60; // 60 requests/min per IP
const clients = new Map<string, RateLimitRecord>();

// Clean up stale clients periodically
const cleanupTimer = setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of clients.entries()) {
    record.timestamps = record.timestamps.filter((ts) => now - ts < windowMs);
    if (record.timestamps.length === 0) {
      clients.delete(ip);
    }
  }
}, 30000);
cleanupTimer.unref();

export function rateLimitMiddleware(req: Request, res: Response, next: NextFunction) {
  const forwarded = req.headers['x-forwarded-for'];
  const ip = typeof forwarded === 'string' 
    ? forwarded.split(',')[0].trim() 
    : (req.socket.remoteAddress || '127.0.0.1');

  const now = Date.now();
  let record = clients.get(ip);

  if (!record) {
    record = { timestamps: [] };
    clients.set(ip, record);
  }

  // Filter timestamps within current window
  record.timestamps = record.timestamps.filter((ts) => now - ts < windowMs);

  if (record.timestamps.length >= maxRequestsPerWindow) {
    res.setHeader('Retry-After', Math.ceil(windowMs / 1000));
    return res.status(429).json({
      success: false,
      error: 'Too many requests. Please slow down and try again in a few moments.',
      rateLimitRemaining: 0,
    });
  }

  record.timestamps.push(now);
  const remaining = maxRequestsPerWindow - record.timestamps.length;
  res.setHeader('X-RateLimit-Limit', maxRequestsPerWindow);
  res.setHeader('X-RateLimit-Remaining', remaining);

  next();
}
