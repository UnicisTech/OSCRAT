import { slugify } from '@/lib/common';
import { ApiError } from '@/lib/errors';
import { getSession } from '@/lib/session';
import { createTeam, getTeams, isTeamExists } from 'models/team';
import { withAuth, type AuthenticatedRequest } from '@/lib/middleware';
import type { NextApiResponse } from 'next';
import { recordMetric } from '@/lib/metrics';

export default function handler(
  req: AuthenticatedRequest,
  res: NextApiResponse
) {
  const { method } = req;

  switch (method) {
    case 'GET':
      return withAuth(['team', 'read'])(handleGET)(req, res);
    case 'POST':
      return handlePOST(req, res);
    default:
      res.setHeader('Allow', 'GET, POST');
      res.status(405).json({
        error: { message: `Method ${method} Not Allowed` },
      });
  }
}

// Get teams
const handleGET = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  const { teamMember, user } = req.teamContext;

  const teams = await getTeams(user.id);

  recordMetric('team.fetched');

  res.status(200).json({ data: teams });
};

// Create a team
const handlePOST = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  const { name } = req.body;
  const { user } = req.teamContext;

  const slug = slugify(name);

  if (await isTeamExists([{ slug }])) {
    throw new ApiError(400, 'A team with the name already exists.');
  }

  const team = await createTeam({
    userId: user.id,
    name,
    slug,
  });

  recordMetric('team.created');

  res.status(200).json({ data: team });
};
