import { createApiKey, fetchApiKeys } from 'models/apiKey';
import { withTeamAuth, type AuthenticatedTeamRequest } from '@/lib/middleware';
import type { NextApiResponse } from 'next';
import { recordMetric } from '@/lib/metrics';
import env from '@/lib/env';
import { ApiError } from '@/lib/errors';
import { parseBody } from '@/lib/validation/validateRequest';
import { apiKeyCreateSchema } from '@/lib/validation/apiKey';

export default function handler(
  req: AuthenticatedTeamRequest,
  res: NextApiResponse
) {
  const { method } = req;

  if (!env.teamFeatures.apiKey) {
    throw new ApiError(404, 'Not Found');
  }

  switch (method) {
    case 'GET':
      return withTeamAuth(['team_api_key', 'read'])(handleGET)(req, res);
    case 'POST':
      return withTeamAuth(['team_api_key', 'create'])(handlePOST)(req, res);
    default:
      res.setHeader('Allow', 'GET, POST');
      throw new ApiError(405, `Method ${method} Not Allowed`);
  }
}

// Get API keys
const handleGET = async (
  req: AuthenticatedTeamRequest,
  res: NextApiResponse
) => {
  const { teamMember } = req.teamContext;

  const apiKeys = await fetchApiKeys(teamMember.teamId);

  recordMetric('apikey.fetched');

  res.json({ data: apiKeys });
};

// Create an API key
const handlePOST = async (
  req: AuthenticatedTeamRequest,
  res: NextApiResponse
) => {
  const { teamMember } = req.teamContext;

  const { name } = await parseBody(apiKeyCreateSchema, req);

  const apiKey = await createApiKey({
    name,
    teamId: teamMember.teamId,
  });

  console.log(`[API Key] created, name: ${name}, teamId: ${teamMember.teamId}`);

  recordMetric('apikey.created');

  res.status(201).json({ data: { apiKey } });
};
