import {
  hashPassword,
  validatePasswordPolicy,
  verifyPassword,
} from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import type { NextApiRequest, NextApiResponse } from 'next';
import { ApiError } from '@/lib/errors';
import { recordMetric } from '@/lib/metrics';
import { withApiHandler } from '@/lib/middleware';
import { parseBody } from '@/lib/validation/validateRequest';
import { updatePasswordSchema } from '@/lib/validation/auth';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  switch (method) {
    case 'PUT':
      await handlePUT(req, res);
      break;
    default:
      res.setHeader('Allow', 'PUT');
      throw new ApiError(405, `Method ${method} Not Allowed`);
  }
}

const handlePUT = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getSession(req, res);

  const { currentPassword, newPassword } = await parseBody(
    updatePasswordSchema,
    req
  );

  const user = await prisma.user.findFirstOrThrow({
    where: { id: session?.user.id },
  });

  if (!(await verifyPassword(currentPassword, user.password as string))) {
    throw new ApiError(400, 'Your current password is incorrect');
  }

  validatePasswordPolicy(newPassword);

  await prisma.user.update({
    where: { id: session?.user.id },
    data: { password: await hashPassword(newPassword) },
  });

  recordMetric('user.password.updated');
  console.log(`[Auth] password updated, userId: ${user.id}`);

  res.status(200).json({});
};

export default withApiHandler(handler);
