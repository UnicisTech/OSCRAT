import { prisma } from '@/lib/prisma';
import * as InvitationOps from '@oscrat/model/operations';
import { Role } from '@oscrat/model';

export const getInvitations = async (teamId: string) => {
  return await InvitationOps.getInvitations(prisma, teamId);
};

export const getInvitation = async (
  key: { token: string } | { id: string }
) => {
  return await InvitationOps.getInvitation(prisma, key);
};

export const createInvitation = async (param: {
  teamId: string;
  invitedBy: string;
  email: string;
  role: Role;
}) => {
  return await InvitationOps.createInvitation(prisma, param);
};

export const deleteInvitation = async (
  key: { token: string } | { id: string }
) => {
  return await InvitationOps.deleteInvitation(prisma, key);
};

export const isInvitationExpired = (invitation: { expires: Date }) => {
  return InvitationOps.isInvitationExpired(invitation);
};
