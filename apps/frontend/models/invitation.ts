import { prisma } from '@/lib/prisma';
import * as InvitationOps from '@oscrat/model/operations';
import { Role, type AuditInfo } from '@oscrat/model';

export const getInvitations = async (teamId: string) => {
  return await InvitationOps.getInvitations(prisma, teamId);
};

export const getInvitation = async (
  key: { token: string } | { id: string }
) => {
  return await InvitationOps.getInvitation(prisma, key);
};

export const createInvitation = async (
  param: {
    teamId: string;
    invitedBy: string;
    email: string;
    role: Role;
  },
  auditInfo?: AuditInfo
) => {
  return await InvitationOps.createInvitation(prisma, param, auditInfo);
};

export const deleteInvitation = async (
  key: { token: string } | { id: string },
  auditInfo?: AuditInfo
) => {
  return await InvitationOps.deleteInvitation(prisma, key, auditInfo);
};

export const isInvitationExpired = (invitation: { expires: Date }) => {
  return InvitationOps.isInvitationExpired(invitation);
};
