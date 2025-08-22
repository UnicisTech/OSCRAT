import { PrismaClient, Role } from '@prisma/client';
import { randomUUID } from 'crypto';

/** Get all invitations for a team */
export const getInvitations = async (prisma: PrismaClient, teamId: string) => {
  return await prisma.invitation.findMany({
    where: {
      teamId,
    },
  });
};

/** Get invitation by token or ID */
export const getInvitation = async (
  prisma: PrismaClient,
  key: { token: string } | { id: string }
) => {
  const invitation = await prisma.invitation.findUnique({
    where: key,
    include: {
      team: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  if (!invitation) {
    throw new Error('Invitation not found');
  }

  return invitation;
};

/** Create a new invitation */
export const createInvitation = async (
  prisma: PrismaClient,
  param: {
    teamId: string;
    invitedBy: string;
    email: string;
    role: Role;
  }
) => {
  const { teamId, invitedBy, email, role } = param;
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  return await prisma.invitation.create({
    data: {
      token: randomUUID(),
      expires,
      teamId,
      invitedBy,
      email,
      role,
    },
  });
};

/** Delete invitation by token or ID */
export const deleteInvitation = async (
  prisma: PrismaClient,
  key: { token: string } | { id: string }
) => {
  return await prisma.invitation.delete({
    where: key,
  });
};

/** Check if invitation is expired */
export const isInvitationExpired = (invitation: { expires: Date }): boolean => {
  return invitation.expires.getTime() < Date.now();
};
