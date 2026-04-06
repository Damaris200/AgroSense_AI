/**
 * Typed application errors.
 * The central error handler in error.middleware.ts maps these to HTTP status codes.
 */

export class AppError extends Error {
  constructor(
    public override readonly message: string,
    public readonly statusCode: number,
  ) {
    super(message);
    this.name = this.constructor.name;
    // Maintain proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/** 400 — malformed request or failed schema validation */
export class ValidationError extends AppError {
  constructor(message = 'Validation failed') { super(message, 400); }
}

/** 401 — missing or invalid authentication token */
export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') { super(message, 401); }
}

/** 403 — authenticated but not permitted */
export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') { super(message, 403); }
}

/** 404 — requested resource does not exist */
export class NotFoundError extends AppError {
  constructor(message = 'Not found') { super(message, 404); }
}

/** 409 — state conflict (e.g. duplicate email) */
export class ConflictError extends AppError {
  constructor(message = 'Conflict') { super(message, 409); }
}
