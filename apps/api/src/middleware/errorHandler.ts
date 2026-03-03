import type { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
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
  
  try {
    const logPath = path.join(process.cwd(), 'api-error.log');
    const logEntry = `[${new Date().toISOString()}] Unhandled error: ${err.message}\nStack: ${err.stack}\n\n`;
    fs.appendFileSync(logPath, logEntry);
  } catch (logError) {
    console.error('Failed to write to error log:', logError);
  }

  res.status(500).json({
    message: 'Internal server error',
    code: 'INTERNAL_ERROR',
  });
}
