import { sendAudit } from '@/lib/retraced';
import { deleteTeam, getTeam, updateTeam } from 'models/team';
import { withTeamAuth, type AuthenticatedTeamRequest } from '@/lib/middleware';
import type { NextApiResponse } from 'next';
import { recordMetric } from '@/lib/metrics';
import { validateDomain } from '@/lib/common';
import { ApiError } from '@/lib/errors';
import type { TeamSettingsUpdate } from '@oscrat/model';

export default function handler(
  req: AuthenticatedTeamRequest,
  res: NextApiResponse
) {
  const { method } = req;

  switch (method) {
    case 'GET':
      return withTeamAuth(['team', 'read'])(handleGET)(req, res);
    case 'PUT':
      return withTeamAuth(['team', 'update'])(handlePUT)(req, res);
    case 'DELETE':
      return withTeamAuth(['team', 'delete'])(handleDELETE)(req, res);
    default:
      res.setHeader('Allow', 'GET, PUT, DELETE');
      res.status(405).json({
        error: { message: `Method ${method} Not Allowed` },
      });
  }
}

// Get a team by slug
const handleGET = async (
  req: AuthenticatedTeamRequest,
  res: NextApiResponse
) => {
  const { teamMember } = req.teamContext;

  const team = await getTeam({ id: teamMember.teamId });

  recordMetric('team.fetched');

  res.status(200).json({ data: team });
};

// Update a team
const handlePUT = async (
  req: AuthenticatedTeamRequest,
  res: NextApiResponse
) => {
  const { teamMember, user } = req.teamContext;

  // Cast to TeamSettingsUpdate - only user-editable fields
  const updateData = req.body as TeamSettingsUpdate;

  if (
    updateData.domain &&
    updateData.domain.length > 0 &&
    !validateDomain(updateData.domain)
  ) {
    throw new ApiError(400, 'Invalid domain name');
  }

  // Update team - Prisma will ignore undefined fields
  const updatedTeam = await updateTeam(teamMember.teamSlug, updateData);

  sendAudit({
    action: 'team.update',
    crud: 'u',
    user: user,
    team: { id: teamMember.teamId, name: teamMember.teamName },
  });

  recordMetric('team.updated');

  res.status(200).json({ data: updatedTeam });
};

// Delete a team
const handleDELETE = async (
  req: AuthenticatedTeamRequest,
  res: NextApiResponse
) => {
  const { teamMember, user } = req.teamContext;

  await deleteTeam({ id: teamMember.teamId });

  sendAudit({
    action: 'team.delete',
    crud: 'd',
    user: user,
    team: { id: teamMember.teamId, name: teamMember.teamName },
  });

  recordMetric('team.removed');

  res.status(200).json({ data: {} });
};
