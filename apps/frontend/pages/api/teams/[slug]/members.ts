import { ApiError } from '@/lib/errors';
import { prisma } from '@/lib/prisma';
import { sendEvent } from '@/lib/svix';
import { Role } from '@oscrat/model';
import { getTeamMembers, removeTeamMember, updateTeamMemberRole } from 'models/team';
import { withTeamAuth, type AuthenticatedTeamRequest } from '@/lib/middleware';
import type { NextApiResponse } from 'next';
import { recordMetric } from '@/lib/metrics';

export default function handler(
  req: AuthenticatedTeamRequest,
  res: NextApiResponse
) {
  const { method } = req;

  switch (method) {
    case 'GET':
      return withTeamAuth(['team_member', 'read'])(handleGET)(req, res);
    case 'DELETE':
      return withTeamAuth(['team_member', 'delete'])(handleDELETE)(req, res);
    case 'PUT':
      return withTeamAuth(['team', 'leave'])(handlePUT)(req, res);
    case 'PATCH':
      return withTeamAuth(['team_member', 'update'])(handlePATCH)(req, res);
    default:
      res.setHeader('Allow', 'GET, DELETE, PUT, PATCH');
      throw new ApiError(405, `Method ${method} Not Allowed`);
  }
}

// Get members of a team
const handleGET = async (
  req: AuthenticatedTeamRequest,
  res: NextApiResponse
) => {
  const { teamMember } = req.teamContext;

  const members = await getTeamMembers(teamMember.teamSlug);

  recordMetric('member.fetched');

  res.status(200).json({ data: members });
};

// Delete the member from the team
const handleDELETE = async (
  req: AuthenticatedTeamRequest,
  res: NextApiResponse
) => {
  const { teamMember, user } = req.teamContext;

  const { userId } = req.query as { userId: string };

  if (!userId) {
    throw new ApiError(400, 'User ID is required.');
  }

  const existingMember = await prisma.teamMember.findUnique({
    where: {
      teamId_userId: {
        teamId: teamMember.teamId,
        userId,
      },
    },
  });

  if (!existingMember) {
    throw new ApiError(404, 'Team member not found.');
  }

  try {
    await removeTeamMember(teamMember.teamId, userId, req.auditInfo);
  } catch (error) {
    console.error('Error removing team member:', error);
    throw new ApiError(500, 'Failed to remove team member.');
  }

  await sendEvent(teamMember.teamId, 'member.removed', existingMember);

  recordMetric('member.removed');

  res.status(200).json({ data: {} });
};

// Leave a team
const handlePUT = async (
  req: AuthenticatedTeamRequest,
  res: NextApiResponse
) => {
  const { teamMember, user } = req.teamContext;

  const totalTeamOwners = await prisma.teamMember.count({
    where: {
      role: Role.OWNER,
      team: { id: teamMember.teamId, name: teamMember.teamName },
    },
  });

  if (totalTeamOwners <= 1) {
    throw new ApiError(400, 'A team should have at least one owner.');
  }

  await removeTeamMember(teamMember.teamId, user.id, req.auditInfo);

  recordMetric('member.left');

  res.status(200).json({ data: {} });
};

// Update the role of a member
const handlePATCH = async (
  req: AuthenticatedTeamRequest,
  res: NextApiResponse
) => {
  const { teamMember, user } = req.teamContext;

  const { memberId, role } = req.body as { memberId: string; role: Role };

  const memberUpdated = await updateTeamMemberRole(
    teamMember.teamId,
    memberId,
    role,
    req.auditInfo
  );

  recordMetric('member.role.updated');

  res.status(200).json({ data: memberUpdated });
};
