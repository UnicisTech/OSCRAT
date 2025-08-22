import jackson from '@/lib/jackson';
import type { NextApiRequest, NextApiResponse } from 'next';
import { withApiHandler } from '@/lib/middleware';
import { ApiError } from '@/lib/errors';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  if (method !== 'GET') {
    res.setHeader('Allow', 'GET');
    throw new ApiError(405, `Method ${method} Not Allowed`);
  }

  const { directorySync } = await jackson();
  const providers = directorySync.providers();

  console.log('[IDP] providers fetched');
  res.status(200).json({ data: providers });
}

export default withApiHandler(handler);
