import type { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      message: err.message,
      code: err.code,
      ...(err.details && { details: err.details }),
    });
    return;
  }

  console.error('Unhandled error:', err);

  res.status(500).json({
    message: 'Internal server error',
    code: 'INTERNAL_ERROR',
  });
}
