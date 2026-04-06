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

export function unauthorized(res: Response, message = 'Unauthorized') {
  fail(res, message, 401);
}

export function forbidden(res: Response, message = 'Forbidden') {
  fail(res, message, 403);
}

export function notFound(res: Response, message = 'Not found') {
  fail(res, message, 404);
}

export function serverError(res: Response, message = 'Internal server error') {
  fail(res, message, 500);
}
