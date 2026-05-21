import { env } from '../config/env';
import { AppError } from '../errors';

export function handleError(err: unknown): Response {
  if (err instanceof AppError) {
    return Response.json({ success: false, error: err.message }, { status: err.statusCode });
  }

  const devMessage = err instanceof Error ? err.message : String(err);
  const message = env.nodeEnv === 'production' ? 'Internal server error' : devMessage;

  return Response.json({ success: false, error: message }, { status: 500 });
}