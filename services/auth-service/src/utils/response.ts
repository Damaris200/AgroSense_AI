import type { Response } from 'express';

export function ok<T>(res: Response, data: T, status = 200) {
  res.status(status).json({ success: true, data });
}

export function created<T>(res: Response, data: T) {
  ok(res, data, 201);
}

export function fail(res: Response, message: string, status = 400) {
  res.status(status).json({ success: false, error: message });
}
