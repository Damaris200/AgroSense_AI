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

export function handleError(err: unknown, context: string): void {
  if (err instanceof AppError) {
    console.error(`[${context}] AppError ${err.statusCode}: ${err.message}`);
    return;
  }
  if (err instanceof Error) {
    console.error(`[${context}] Error: ${err.message}`);
    return;
  }
  console.error(`[${context}] Unknown error:`, err);
}