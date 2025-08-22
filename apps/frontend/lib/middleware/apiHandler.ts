import type { NextApiRequest, NextApiResponse } from 'next';
import { createMiddleware } from './auth';

/**
 * Universal API middleware for error handling and logging
 * Use this for endpoints that don't require authentication
 */
export function withApiHandler<T = any>(
  handler: (req: NextApiRequest, res: NextApiResponse<T>) => Promise<void>
) {
  return createMiddleware<T>()(handler);
}
