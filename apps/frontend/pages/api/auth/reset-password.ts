import { hashPassword, validatePasswordPolicy } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { NextApiRequest, NextApiResponse } from 'next';
import { ApiError } from '@/lib/errors';
import { recordMetric } from '@/lib/metrics';
import { withApiHandler } from '@/lib/middleware';

async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  switch (method) {
    case 'POST':
      await handlePOST(req, res);
      break;
    default:
      res.setHeader('Allow', 'POST');
      throw new ApiError(405, `Method ${method} Not Allowed`);
  }
}

export default withApiHandler(handler);

const handlePOST = async (req: NextApiRequest, res: NextApiResponse) => {
  const { token, password } = req.body;

  if (!token) {
    throw new ApiError(422, 'Password reset token is required');
  }

  validatePasswordPolicy(password);

  const passwordReset = await prisma.passwordReset.findUnique({
    where: { token },
  });

  if (!passwordReset) {
    throw new ApiError(
      422,
      'Invalid password reset token. Please request a new one.'
    );
  }

  if (passwordReset.expiresAt < new Date()) {
    throw new ApiError(
      422,
      'Password reset token has expired. Please request a new one.'
    );
  }

  const hashedPassword = await hashPassword(password);

  await Promise.all([
    prisma.user.update({
      where: { email: passwordReset.email },
      data: {
        password: hashedPassword,
      },
    }),
    prisma.passwordReset.delete({
      where: { token },
    }),
  ]);

  recordMetric('user.password.reset');

  res.status(200).json({ message: 'Password reset successfully' });
};
