import { randomUUID } from 'crypto';
import { prisma } from '@/lib/prisma';

export const JWT_SESSION_MAX_AGE = 7 * 24 * 60 * 60;

const sessionExpiry = () => new Date(Date.now() + JWT_SESSION_MAX_AGE * 1000);

export const createServerSession = async (userId: string) => {
  const sessionToken = randomUUID();

  await prisma.session.create({
    data: {
      sessionToken,
      userId,
      expires: sessionExpiry(),
    },
  });

  return sessionToken;
};

export const refreshServerSession = async (sessionToken: string) => {
  const session = await prisma.session.findUnique({
    where: { sessionToken },
    select: { expires: true },
  });

  if (!session || session.expires <= new Date()) {
    return false;
  }

  await prisma.session.update({
    where: { sessionToken },
    data: { expires: sessionExpiry() },
  });

  return true;
};

export const revokeServerSession = async (sessionToken: string) => {
  await prisma.session.deleteMany({ where: { sessionToken } });
};
