import type { Request, Response, NextFunction } from 'express';
import { type ZodSchema, ZodError } from 'zod';

interface ValidationErrorDetail {
  path: string;
  message: string;
}

/**
 * Returns an Express middleware that validates req.body against `schema`.
 *
 * On success:  replaces req.body with the parsed (typed, cleaned) data and calls next().
 * On failure:  responds with HTTP 400 and { error, details } — does NOT call next().
 *
 * The schema should use .strict() to reject unknown fields.
 */
export function validateBody<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const details: ValidationErrorDetail[] = (result.error as ZodError).issues.map((issue) => {
        const path = issue.path.length > 0 ? issue.path.join('.') : '';
        return { path, message: issue.message };
      });

      res.status(400).json({
        error: 'ValidationError',
        details,
      });
      return;
    }

    req.body = result.data;
    next();
  };
}
