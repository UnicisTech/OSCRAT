import { PrismaClient } from '@prisma/client';
import { createHash, randomBytes } from 'crypto';

/** Hash an API key */
export const hashApiKey = (apiKey: string): string => {
  return createHash('sha256').update(apiKey).digest('hex');
};

/** Generate unique API key pair */
export const generateUniqueApiKey = (): [string, string] => {
  const apiKey = randomBytes(16).toString('hex');
  return [hashApiKey(apiKey), apiKey];
};

/** Create a new API key */
export const createApiKey = async (
  prisma: PrismaClient,
  params: {
    name: string;
    teamId: string;
  }
) => {
  const { name, teamId } = params;
  const [hashedKey, apiKey] = generateUniqueApiKey();

  await prisma.apiKey.create({
    data: {
      name,
      hashedKey: hashedKey,
      team: { connect: { id: teamId } },
    },
  });

  return apiKey;
};

/** Get all API keys for a team */
export const fetchApiKeys = async (prisma: PrismaClient, teamId: string) => {
  return prisma.apiKey.findMany({
    where: {
      teamId,
    },
  });
};

/** Delete an API key */
export const deleteApiKey = async (prisma: PrismaClient, id: string) => {
  return prisma.apiKey.delete({
    where: {
      id,
    },
  });
};