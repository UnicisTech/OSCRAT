import type { NextApiRequest, NextApiResponse } from 'next';
import { isPrismaError } from '@/lib/errors';
import { randomUUID } from 'crypto';

/**
 * Universal API middleware for error handling and logging
 * Use this for endpoints that don't require team authentication
 */
export function withApiHandler<T = any>(
  handler: (req: NextApiRequest, res: NextApiResponse<T>) => Promise<void>
) {
  return async (req: NextApiRequest, res: NextApiResponse<T>) => {
    const { method, url } = req;
    const requestId = randomUUID().slice(0, 8);
    
    // Set security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    
    console.log(`[API] ${method} ${url} start, id: ${requestId}`);

    try {
      await handler(req, res);
      console.log(`[API] ${method} ${url} success, id: ${requestId}`);
    } catch (error: any) {
      const message = error.message || 'Something went wrong';
      const status = error.status || 500;

      // Log database errors with more context
      if (isPrismaError(error)) {
        console.log(`[DB Error] ${method} ${url} failed, error: ${message}, id: ${requestId}`);
      } else {
        console.log(`[API Error] ${method} ${url} failed, error: ${message}, id: ${requestId}`);
      }

      res.status(status).json({ error: { message } } as T);
    }
  };
}