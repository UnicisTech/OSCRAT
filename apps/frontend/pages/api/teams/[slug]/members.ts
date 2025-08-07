import { ApiError } from '@/lib/errors';
import { prisma } from '@/lib/prisma';
import { sendAudit } from '@/lib/retraced';
import { sendEvent } from '@/lib/svix';
import { Role } from '@oscrat/model';
import {
  getTeamMembers,
  removeTeamMember,
} from 'models/team';
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
      return withAuth(['team_member', 'read'])(handleGET)(req, res);
    case 'DELETE':
      return withAuth(['team_member', 'delete'])(handleDELETE)(req, res);
    case 'PUT':
      return withAuth(['team', 'leave'])(handlePUT)(req, res);
    case 'PATCH':
      return withAuth(['team_member', 'update'])(handlePATCH)(req, res);
    default:
      res.setHeader('Allow', 'GET, DELETE, PUT, PATCH');
      res.status(405).json({
        error: { message: `Method ${method} Not Allowed` },
      });
  }
}

// Get members of a team
const handleGET = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  const { teamMember } = req.teamContext;

  const members = await getTeamMembers(teamMember.team.slug);

  recordMetric('member.fetched');

  res.status(200).json({ data: members });
};

// Delete the member from the team
const handleDELETE = async (req: AuthenticatedRequest, res: NextApiResponse) => {
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

  let teamMemberRemoved;
  try {
    teamMemberRemoved = await removeTeamMember(teamMember.teamId, userId);
  } catch (error) {
    console.error('Error removing team member:', error);
    throw new ApiError(500, 'Failed to remove team member.');
  }

  if (!teamMemberRemoved) {
    throw new ApiError(404, 'Team member not found.');
  }

  await sendEvent(teamMember.teamId, 'member.removed', teamMemberRemoved);

  sendAudit({
    action: 'member.remove',
    crud: 'd',
    user: user,
    team: teamMember.team,
  });

  recordMetric('member.removed');

  res.status(200).json({ data: {} });
};

// Leave a team
const handlePUT = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  const { teamMember, user } = req.teamContext;

  const totalTeamOwners = await prisma.teamMember.count({
    where: {
      role: Role.OWNER,
      teamId: teamMember.teamId,
    },
  });

  if (totalTeamOwners <= 1) {
    throw new ApiError(400, 'A team should have at least one owner.');
  }

  await removeTeamMember(teamMember.teamId, user.id);

  recordMetric('member.left');

  res.status(200).json({ data: {} });
};

// Update the role of a member
const handlePATCH = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  const { teamMember, user } = req.teamContext;

  const { memberId, role } = req.body as { memberId: string; role: Role };

  const memberUpdated = await prisma.teamMember.update({
    where: {
      teamId_userId: {
        teamId: teamMember.teamId,
        userId: memberId,
      },
    },
    data: {
      role,
    },
  });

  sendAudit({
    action: 'member.update',
    crud: 'u',
    user: user,
    team: teamMember.team,
  });

  recordMetric('member.role.updated');

  res.status(200).json({ data: memberUpdated });
};
