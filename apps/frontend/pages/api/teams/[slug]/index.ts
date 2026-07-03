import { deleteTeam, getTeamDetail, updateTeam } from 'models/team';
import { withTeamAuth, type AuthenticatedTeamRequest } from '@/lib/middleware';
import type { NextApiResponse } from 'next';
import { recordMetric } from '@/lib/metrics';
import { parseBody } from '@/lib/validation/validateRequest';
import { teamSettingsSchema } from '@/lib/validation/team';

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

  const team = await getTeamDetail({ id: teamMember.teamId });

  recordMetric('team.fetched');

  res.status(200).json({ data: team });
};

// Update a team
const handlePUT = async (
  req: AuthenticatedTeamRequest,
  res: NextApiResponse
) => {
  const { teamMember, user } = req.teamContext;

  const updateData = await parseBody(teamSettingsSchema, req);

  const updatedTeam = await updateTeam(teamMember.teamSlug, updateData, {
    user,
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

  await deleteTeam(
    { id: teamMember.teamId },
    {
      user,
      team: { id: teamMember.teamId, name: teamMember.teamName },
    }
  );

  recordMetric('team.removed');

  res.status(200).json({ data: {} });
};
