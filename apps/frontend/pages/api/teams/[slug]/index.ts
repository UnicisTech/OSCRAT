import { sendAudit } from '@/lib/retraced';
import {
  deleteTeam,
  getTeam,
  updateTeam,
} from 'models/team';
import { withAuth, type AuthenticatedRequest } from '@/lib/middleware';
import type { NextApiResponse } from 'next';
import { recordMetric } from '@/lib/metrics';
import { validateDomain } from '@/lib/common';
import { ApiError } from '@/lib/errors';

export default function handler(
  req: AuthenticatedRequest,
  res: NextApiResponse
) {
  const { method } = req;

  switch (method) {
    case 'GET':
      return withAuth(['team', 'read'])(handleGET)(req, res);
    case 'PUT':
      return withAuth(['team', 'update'])(handlePUT)(req, res);
    case 'DELETE':
      return withAuth(['team', 'delete'])(handleDELETE)(req, res);
    default:
      res.setHeader('Allow', 'GET, PUT, DELETE');
      res.status(405).json({
        error: { message: `Method ${method} Not Allowed` },
      });
  }
}

// Get a team by slug
const handleGET = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  const { teamMember, user } = req.teamContext;

  const team = await getTeam({ id: teamMember.teamId });

  recordMetric('team.fetched');

  res.status(200).json({ data: team });
};

// Update a team
const handlePUT = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  const { teamMember, user } = req.teamContext;

  const { name, slug, domain } = req.body;

  if (domain?.length > 0 && !validateDomain(domain)) {
    throw new ApiError(400, 'Invalid domain name');
  }

  const updatedTeam = await updateTeam(teamMember.team.slug, {
    name,
    slug,
    domain,
  });

  sendAudit({
    action: 'team.update',
    crud: 'u',
    user: user,
    team: teamMember.team,
  });

  recordMetric('team.updated');

  res.status(200).json({ data: updatedTeam });
};

// Delete a team
const handleDELETE = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  const { teamMember, user } = req.teamContext;

  await deleteTeam({ id: teamMember.teamId });

  sendAudit({
    action: 'team.delete',
    crud: 'd',
    user: user,
    team: teamMember.team,
  });

  recordMetric('team.removed');

  res.status(200).json({ data: {} });
};
