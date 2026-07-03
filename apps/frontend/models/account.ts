import { prisma } from '@/lib/prisma';

export const getLinkedAccount = async (key: {
  provider: string;
  providerAccountId: string;
}) => {
  return await prisma.account.findUnique({
    where: {
      provider_providerAccountId: {
        provider: key.provider,
        providerAccountId: key.providerAccountId,
      },
    },
  });
};
