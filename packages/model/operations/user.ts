import { PrismaClient } from '@prisma/client';

/** Create a new user */
export const createUser = async (
  prisma: PrismaClient,
  param: {
    name: string;
    firstName: string;
    lastName: string;
    email: string;
    password?: string;
    emailVerified?: Date | null;
  }
) => {
  const { name, firstName, lastName, email, password, emailVerified } = param;

  return await prisma.user.create({
    data: {
      name,
      firstName,
      lastName,
      email,
      password: password ? password : '',
      emailVerified: emailVerified ? emailVerified : null,
    },
  });
};

/** Get user by ID or email */
export const getUser = async (
  prisma: PrismaClient,
  key: { id: string } | { email: string }
) => {
  return await prisma.user.findUnique({
    where: key,
  });
};

/** Delete user by ID or email */
export const deleteUser = async (
  prisma: PrismaClient,
  key: { id: string } | { email: string }
) => {
  return await prisma.user.delete({
    where: key,
  });
};