import { AppError } from '../errors';

export function handleError(err: unknown): Response {
  if (err instanceof AppError) {
    return Response.json({ success: false, error: err.message }, { status: err.statusCode });
  }
  const message = process.env.NODE_ENV === 'production'
    ? 'Internal server error'
    : (err instanceof Error ? err.message : String(err));
  return Response.json({ success: false, error: message }, { status: 500 });
}
