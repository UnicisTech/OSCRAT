import type { NextApiRequest } from 'next';
import { ApiError } from '@/types';

export const getIpAddress = (req: NextApiRequest): string => {
  return (req.headers['x-forwarded-for'] ||
    req.socket.remoteAddress ||
    req.connection?.remoteAddress ||
    'unknown') as string;
};

export const capitalizeCountryName = (name: string) => {
  if (name === 'usa') return 'USA'; // Special case for USA
  return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
};

/**
 * Extracts a meaningful error message from different error types
 * @param error The caught error
 * @param fallbackMessage A fallback message to show if no error message is available
 * @returns The error message to display
 */
export function extractErrorMessage(
  error: unknown,
  fallbackMessage: string
): string {
  if (error instanceof Error) {
    return error.message || fallbackMessage;
  }

  const apiError = error as ApiError;
  if (apiError?.message) {
    return apiError.message;
  }

  return fallbackMessage;
}
