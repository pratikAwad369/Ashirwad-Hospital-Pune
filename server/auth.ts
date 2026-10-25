import crypto from 'crypto';
import type { Request, Response, NextFunction } from 'express';
import { db } from './db.js';
import type { AdminUser } from './types.js';

const SESSION_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const SESSIONS = new Map<string, { userId: string; expiresAt: number }>();

export function hashPassword(password: string): { hash: string; salt: string } {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return { hash, salt };
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  try {
    const candidateHash = crypto.scryptSync(password, salt, 64).toString('hex');
    return crypto.timingSafeEqual(Buffer.from(candidateHash, 'hex'), Buffer.from(hash, 'hex'));
  } catch {
    return false;
  }
}

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function generateManagementToken(): string {
  // Returns high-entropy base64url token (32 bytes = 256 bits)
  return crypto.randomBytes(32).toString('base64url');
}

export function createSession(userId: string): string {
  const sessionId = crypto.randomBytes(32).toString('hex');
  SESSIONS.set(sessionId, {
    userId,
    expiresAt: Date.now() + SESSION_TTL_MS,
  });
  return sessionId;
}

export function destroySession(sessionId: string): void {
  SESSIONS.delete(sessionId);
}

export function getSessionUser(sessionId?: string): AdminUser | null {
  if (!sessionId) return null;
  const session = SESSIONS.get(sessionId);
  if (!session) return null;

  if (Date.now() > session.expiresAt) {
    SESSIONS.delete(sessionId);
    return null;
  }

  const user = db.getAdminById(session.userId);
  return user || null;
}

// Express Auth Middleware
export interface AuthenticatedRequest extends Request {
  adminUser?: AdminUser;
}

export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const sessionToken = req.cookies?.ash_admin_session || req.headers['authorization']?.replace(/^Bearer\s+/i, '');
  const user = getSessionUser(sessionToken);

  if (!user) {
    res.status(401).json({ error: 'Unauthorized. Administrative session required.' });
    return;
  }

  req.adminUser = user;
  next();
}

// In-Memory Rate Limiter
interface RateLimitRecord {
  count: number;
  resetAt: number;
}
const rateLimits = new Map<string, RateLimitRecord>();

export function rateLimit(options: { windowMs: number; max: number; message?: string }) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const ip = req.headers['x-forwarded-for']?.toString().split(',')[0].trim() || req.socket.remoteAddress || 'unknown';
    const key = `${req.baseUrl || ''}${req.path}:${ip}`;
    const now = Date.now();
    const record = rateLimits.get(key);

    if (!record || now > record.resetAt) {
      rateLimits.set(key, { count: 1, resetAt: now + options.windowMs });
      next();
      return;
    }

    if (record.count >= options.max) {
      res.status(429).json({
        error: options.message || 'Too many requests. Please try again after a few minutes.'
      });
      return;
    }

    record.count += 1;
    next();
  };
}
