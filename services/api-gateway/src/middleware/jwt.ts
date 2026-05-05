import type { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';

export interface JwtPayload {
  sub:   string;
  role:  string;
  email: string;
  name?: string;
  exp?:  number;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      jwtUser?: JwtPayload;
    }
  }
}

async function verifyJwt(token: string, secret: string): Promise<JwtPayload | null> {
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [headerB64, payloadB64, sigB64] = parts as [string, string, string];

  try {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify'],
    );

    const data   = encoder.encode(`${headerB64}.${payloadB64}`);
    const sigBuf = Buffer.from(sigB64, 'base64url');
    const valid  = await crypto.subtle.verify('HMAC', key, sigBuf, data);
    if (!valid) return null;

    const payload: JwtPayload = JSON.parse(
      Buffer.from(payloadB64, 'base64url').toString('utf-8'),
    );
    if (payload.exp && Date.now() / 1000 > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return next();
  const token = header.slice(7);
  req.jwtUser = (await verifyJwt(token, env.jwtSecret)) ?? undefined;
  next();
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ success: false, error: 'Authentication required' });
    return;
  }
  const token   = header.slice(7);
  const payload = await verifyJwt(token, env.jwtSecret);
  if (!payload) {
    res.status(401).json({ success: false, error: 'Invalid or expired token' });
    return;
  }
  req.jwtUser = payload;
  next();
}
