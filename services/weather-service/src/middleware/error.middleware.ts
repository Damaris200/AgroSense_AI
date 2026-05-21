import { AppError } from '../errors';

export function handleError(err: unknown): Response {
  if (err instanceof AppError) {
    return Response.json({ success: false, error: err.message }, { status: err.statusCode });
  }
  let message: string;
  if (process.env.NODE_ENV === 'production') {
    message = 'Internal server error';
  } else if (err instanceof Error) {
    message = err.message;
  } else {
    message = String(err);
  }
  return Response.json({ success: false, error: message }, { status: 500 });
}
