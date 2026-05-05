export class AppError extends Error {
  constructor(
    public override readonly message: string,
    public readonly statusCode: number,
  ) {
    super(message);
    this.name = this.constructor.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Not found') { super(message, 404); }
}

export class ValidationError extends AppError {
  constructor(message = 'Validation failed') { super(message, 400); }
}