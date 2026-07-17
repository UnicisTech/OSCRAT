import { PrismaClient } from '@prisma/client';

export enum EmailChangeStatus {
  OK = 'OK',
  EMAIL_IN_USE = 'EMAIL_IN_USE',
}

export type EmailChangeResult = { status: EmailChangeStatus };

/** Whether the address already belongs to a different user. */
const isEmailTaken = async (
  prisma: PrismaClient,
  newEmail: string,
  userId: string
) => {
  const existing = await prisma.user.findUnique({ where: { email: newEmail } });
  return Boolean(existing && existing.id !== userId);
};

/** Apply an email change immediately (used when confirmation is disabled). */
export const applyEmailChange = async (
  prisma: PrismaClient,
  param: { userId: string; newEmail: string }
): Promise<EmailChangeResult> => {
  const { userId, newEmail } = param;

  if (await isEmailTaken(prisma, newEmail, userId)) {
    return { status: EmailChangeStatus.EMAIL_IN_USE };
  }

  await prisma.user.update({
    where: { id: userId },
    data: { email: newEmail },
  });

  return { status: EmailChangeStatus.OK };
};

/**
 * Store a pending email change awaiting confirmation, replacing any earlier
 * pending one for the same user.
 */
export const requestEmailChange = async (
  prisma: PrismaClient,
  param: {
    userId: string;
    newEmail: string;
    token: string;
    expiresAt: Date;
  }
): Promise<EmailChangeResult> => {
  const { userId, newEmail, token, expiresAt } = param;

  if (await isEmailTaken(prisma, newEmail, userId)) {
    return { status: EmailChangeStatus.EMAIL_IN_USE };
  }

  await prisma.$transaction([
    prisma.emailChange.deleteMany({ where: { userId } }),
    prisma.emailChange.create({
      data: { userId, newEmail, token, expiresAt },
    }),
  ]);

  return { status: EmailChangeStatus.OK };
};

/** Get a pending email change by its confirmation token */
export const getEmailChangeByToken = async (
  prisma: PrismaClient,
  token: string
) => {
  return await prisma.emailChange.findUnique({
    where: { token },
  });
};

/** Whether a pending email change has passed its expiry */
export const isEmailChangeExpired = (emailChange: { expiresAt: Date }) => {
  return new Date() > emailChange.expiresAt;
};

/**
 * Apply a confirmed email change: swap the user's email (marking it verified)
 * and consume the token, atomically. Rejects with a unique-constraint error if
 * the address was claimed by another account since the link was issued.
 */
export const confirmEmailChange = async (
  prisma: PrismaClient,
  param: {
    token: string;
    userId: string;
    newEmail: string;
  }
) => {
  const { token, userId, newEmail } = param;

  return await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: {
        email: newEmail,
        emailVerified: new Date(),
      },
    }),
    prisma.emailChange.delete({
      where: { token },
    }),
  ]);
};
