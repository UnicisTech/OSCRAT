import { sendTeamInviteEmail } from '@/lib/email/sendTeamInviteEmail';
import { ApiError } from '@/lib/errors';
import { prisma } from '@/lib/prisma';
import { sendEvent } from '@/lib/svix';
import {
  createInvitation,
  deleteInvitation,
  getInvitation,
  getInvitations,
} from 'models/invitation';
import { withTeamAuth, type AuthenticatedTeamRequest } from '@/lib/middleware';
import { withApiHandler } from '@/lib/middleware';
import { inviteMemberSchema } from '@/lib/validation/team';
import { validateRequest } from '@/lib/validation/validateRequest';
import type { NextApiRequest, NextApiResponse } from 'next';
import { recordMetric } from '@/lib/metrics';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  switch (method) {
    case 'GET':
      return withTeamAuth(['team_invitation', 'read'])(handleGET)(req, res);
    case 'POST':
      return withTeamAuth(['team_invitation', 'create'])(handlePOST)(req, res);
    case 'DELETE':
      return withTeamAuth(['team_invitation', 'delete'])(handleDELETE)(
        req,
        res
      );
    default:
      res.setHeader('Allow', 'GET, POST, DELETE');
      throw new ApiError(405, `Method ${method} Not Allowed`);
  }
}

export default withApiHandler(handler);

const handlePOST = async (
  req: AuthenticatedTeamRequest,
  res: NextApiResponse
) => {
  const { teamMember, user } = req.teamContext;

  const { email, role } = await validateRequest(inviteMemberSchema, req.body);

  const invitationExists = await prisma.invitation.findFirst({
    where: {
      email,
      teamId: teamMember.teamId,
    },
  });

  if (invitationExists) {
    throw new ApiError(400, 'An invitation already exists for this email.');
  }

  const userExist = await prisma.teamMember.findFirst({
    where: {
      user: {
        email: email,
      },
      teamId: teamMember.teamId,
    },
    include: {
      user: true,
      team: true,
    },
  });

  if (userExist) {
    throw new ApiError(400, 'This user is already in your organization.');
  }

  const invitation = await createInvitation(
    {
      teamId: teamMember.teamId,
      invitedBy: user.id,
      email,
      role,
    },
    req.auditInfo
  );

  try {
    await sendEvent(teamMember.teamId, 'invitation.created', invitation);
  } catch (error) {
    console.error('[Invitation] Failed to send webhook event:', error);
  }

  try {
    await sendTeamInviteEmail(teamMember.teamName, invitation);
  } catch (error) {
    console.error('[Invitation] Failed to send invite email:', error);
  }

  recordMetric('invitation.created');

  res.status(200).json({ data: invitation });
};

// Get all invitations for a team
const handleGET = async (
  req: AuthenticatedTeamRequest,
  res: NextApiResponse
) => {
  const { teamMember } = req.teamContext;

  const invitations = await getInvitations(teamMember.teamId);

  recordMetric('invitation.fetched');

  res.status(200).json({ data: invitations });
};

// Delete an invitation
const handleDELETE = async (
  req: AuthenticatedTeamRequest,
  res: NextApiResponse
) => {
  const { teamMember } = req.teamContext;

  const { id } = req.query as { id: string };

  if (!id) {
    throw new ApiError(400, 'Invitation ID is required.');
  }

  const invitation = await getInvitation({ id });

  if (invitation.teamId != teamMember.teamId) {
    throw new ApiError(
      400,
      `You don't have permission to delete this invitation.`
    );
  }

  try {
    await deleteInvitation({ id }, req.auditInfo);
  } catch (error) {
    console.error('Error deleting invitation:', error);
    throw new ApiError(500, 'Failed to delete invitation.');
  }

  await sendEvent(teamMember.teamId, 'invitation.removed', invitation);

  recordMetric('invitation.removed');

  res.status(200).json({ data: {} });
};
