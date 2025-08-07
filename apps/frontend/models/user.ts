import { prisma } from '@/lib/prisma';
import * as UserOps from '@oscrat/model/operations';
import type { Session } from 'next-auth';

export const createUser = async (param: {
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  emailVerified?: Date | null;
}) => {
  return await UserOps.createUser(prisma, param);
};

export const getUser = async (key: { id: string } | { email: string }) => {
  console.log('getUser', key);
  return await UserOps.getUser(prisma, key);
};

export const getUserBySession = async (session: Session | null) => {
  if (session === null || session.user === null) {
    return null;
  }

  const id = session?.user?.id;

  if (!id) {
    return null;
  }

  return await UserOps.getUser(prisma, { id });
};

export const deleteUser = async (key: { id: string } | { email: string }) => {
  return await UserOps.deleteUser(prisma, key);
};
