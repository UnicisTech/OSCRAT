import { PrismaClient, Role } from '@prisma/client';
import { randomUUID } from 'crypto';
import { createAuditContextWithTx, logCreate, logDelete, EntityType, type AuditInfo } from '../audit';

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
  },
  auditInfo?: AuditInfo
) => {
  const { teamId, invitedBy, email, role } = param;
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  return await prisma.$transaction(async (tx) => {
    const invitation = await tx.invitation.create({
      data: {
        token: randomUUID(),
        expires,
        teamId,
        invitedBy,
        email,
        role,
      },
    });

    if (auditInfo) {
      const audit = createAuditContextWithTx(tx, auditInfo);
      await logCreate(EntityType.Invitation, audit, {
        id: invitation.id,
        name: email,
        email,
        role,
      });
    }

    return invitation;
  });
};

/** Delete invitation by token or ID */
export const deleteInvitation = async (
  prisma: PrismaClient,
  key: { token: string } | { id: string },
  auditInfo?: AuditInfo
) => {
  return await prisma.$transaction(async (tx) => {
    const invitation = await tx.invitation.findUnique({
      where: key,
      select: { id: true, email: true },
    });

    if (!invitation) {
      throw new Error('Invitation not found');
    }

    if (auditInfo) {
      const audit = createAuditContextWithTx(tx, auditInfo);
      await logDelete(EntityType.Invitation, audit, {
        id: invitation.id,
        name: invitation.email,
      });
    }

    const result = await tx.invitation.delete({
      where: key,
    });

    return result;
  });
};

/** Check if invitation is expired */
export const isInvitationExpired = (invitation: { expires: Date }): boolean => {
  return invitation.expires.getTime() < Date.now();
};
