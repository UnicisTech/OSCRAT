import { prisma } from '@/lib/prisma';
import * as EmailChangeOps from '@oscrat/model/operations';

export { EmailChangeStatus } from '@oscrat/model/operations';

export const applyEmailChange = async (param: {
  userId: string;
  newEmail: string;
}) => {
  return await EmailChangeOps.applyEmailChange(prisma, param);
};

export const requestEmailChange = async (param: {
  userId: string;
  newEmail: string;
  token: string;
  expiresAt: Date;
}) => {
  return await EmailChangeOps.requestEmailChange(prisma, param);
};

export const getEmailChangeByToken = async (token: string) => {
  return await EmailChangeOps.getEmailChangeByToken(prisma, token);
};

export const isEmailChangeExpired = (emailChange: { expiresAt: Date }) => {
  return EmailChangeOps.isEmailChangeExpired(emailChange);
};

export const confirmEmailChange = async (param: {
  token: string;
  userId: string;
  newEmail: string;
}) => {
  return await EmailChangeOps.confirmEmailChange(prisma, param);
};
