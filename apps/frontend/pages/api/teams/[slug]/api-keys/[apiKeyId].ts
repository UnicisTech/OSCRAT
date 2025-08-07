import { deleteApiKey } from 'models/apiKey';
import { withAuth, type AuthenticatedRequest } from '@/lib/middleware';
import type { NextApiResponse } from 'next';
import { recordMetric } from '@/lib/metrics';
import env from '@/lib/env';
import { ApiError } from '@/lib/errors';

export default function handler(
  req: AuthenticatedRequest,
  res: NextApiResponse
) {
  const { method } = req;

  if (!env.teamFeatures.apiKey) {
    throw new ApiError(404, 'Not Found');
  }

  switch (method) {
    case 'DELETE':
      return withAuth(['team_api_key', 'delete'])(handleDELETE)(req, res);
    default:
      res.setHeader('Allow', 'DELETE');
      res.status(405).json({
        error: { message: `Method ${method} Not Allowed` },
      });
  }
}

// Delete an API key
const handleDELETE = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  const { teamMember } = req.teamContext;

  const { apiKeyId } = req.query as { apiKeyId: string };

  await deleteApiKey(apiKeyId);

  recordMetric('apikey.removed');

  res.json({ data: {} });
};
