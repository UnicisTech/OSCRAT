import { createApiKey, fetchApiKeys } from 'models/apiKey';
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
    case 'GET':
      return withAuth(['team_api_key', 'read'])(handleGET)(req, res);
    case 'POST':
      return withAuth(['team_api_key', 'create'])(handlePOST)(req, res);
    default:
      res.setHeader('Allow', 'GET, POST');
      res.status(405).json({
        error: { message: `Method ${method} Not Allowed` },
      });
  }
}

// Get API keys
const handleGET = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  const { teamMember } = req.teamContext;

  const apiKeys = await fetchApiKeys(teamMember.teamId);

  recordMetric('apikey.fetched');

  res.json({ data: apiKeys });
};

// Create an API key
const handlePOST = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  const { teamMember } = req.teamContext;

  const { name } = JSON.parse(req.body) as { name: string };

  const apiKey = await createApiKey({
    name,
    teamId: teamMember.teamId,
  });

  recordMetric('apikey.created');

  res.status(201).json({ data: { apiKey } });
};
