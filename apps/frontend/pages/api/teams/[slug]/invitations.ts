import { sendTeamInviteEmail } from '@/lib/email/sendTeamInviteEmail';
import { ApiError } from '@/lib/errors';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { sendEvent } from '@/lib/svix';
import {
  createInvitation,
  deleteInvitation,
  getInvitation,
  getInvitations,
  isInvitationExpired,
} from 'models/invitation';
import { addTeamMember } from 'models/team';
import { withTeamAuth, type AuthenticatedTeamRequest } from '@/lib/middleware';
import type { NextApiResponse } from 'next';
import { recordMetric } from '@/lib/metrics';
import { toPlainObject } from '@/lib/utils';

export default function handler(
  req: AuthenticatedTeamRequest,
  res: NextApiResponse
) {
  const { method } = req;

  switch (method) {
    case 'GET':
      return withTeamAuth(['team_invitation', 'read'])(handleGET)(req, res);
    case 'POST':
      return withTeamAuth(['team_invitation', 'create'])(handlePOST)(req, res);
    case 'PUT':
      return withTeamAuth()(handlePUT)(req, res);
    case 'DELETE':
      return withTeamAuth(['team_invitation', 'delete'])(handleDELETE)(
        req,
        res
      );
    default:
      res.setHeader('Allow', 'GET, POST, PUT, DELETE');
      throw new ApiError(405, `Method ${method} Not Allowed`);
  }
}

// Invite a user to a team
const handlePOST = async (
  req: AuthenticatedTeamRequest,
  res: NextApiResponse
) => {
  const { teamMember, user } = req.teamContext;

  const { email, role } = req.body;

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
    throw new ApiError(400, 'This user already in your team.');
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

  await sendEvent(teamMember.teamId, 'invitation.created', invitation);

  await sendTeamInviteEmail(teamMember.teamName, invitation);

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
  const { teamMember, user } = req.teamContext;

  const { id } = req.query as { id: string };

  if (!id) {
    throw new ApiError(400, 'Invitation ID is required.');
  }

  const invitation = await getInvitation({ id });

  if (
    invitation.invitedBy != user.id ||
    invitation.teamId != teamMember.teamId
  ) {
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

// Accept an invitation to an organization
const handlePUT = async (
  req: AuthenticatedTeamRequest,
  res: NextApiResponse
) => {
  const { inviteToken } = req.body as { inviteToken: string };

  const invitation = await getInvitation({ token: inviteToken });

  if (await isInvitationExpired(invitation)) {
    throw new ApiError(400, 'Invitation expired. Please request a new one.');
  }

  const session = await getSession(req, res);
  const userId = session?.user?.id as string;

  if (session?.user.email != invitation.email) {
    throw new ApiError(
      400,
      'You must be logged in with the email address you were invited with.'
    );
  }

  const teamMember = await addTeamMember(
    invitation.team.id,
    userId,
    invitation.role,
    {
      user: { id: session.user.id, name: session.user.name },
      team: { id: invitation.team.id, name: invitation.team.name },
    }
  );

  await sendEvent(
    invitation.team.id,
    'member.created',
    toPlainObject(teamMember)
  );
  await deleteInvitation({ token: inviteToken });

  recordMetric('member.created');

  res.status(200).json({ data: {} });
};
