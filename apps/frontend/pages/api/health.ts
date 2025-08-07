import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { withApiHandler } from '@/lib/middleware';
import { ApiError } from '@/lib/errors';
import packageInfo from '../../package.json';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  if (method !== 'GET') {
    res.setHeader('Allow', 'GET');
    throw new ApiError(405, `Method ${method} Not Allowed`);
  }

  // Test database connection
  let dbStatus = 'connected';
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch (error) {
    dbStatus = 'disconnected';
    throw new ApiError(503, 'Database connection failed');
  }

  res.status(200).json({
    status: 'ok',
    version: packageInfo.version,
    database: dbStatus,
    timestamp: new Date().toISOString(),
  });
}

export default withApiHandler(handler);
