import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import type { NextApiRequest, NextApiResponse } from 'next';
import { recordMetric } from '@/lib/metrics';
import { ApiError } from '@/lib/errors';
import env from '@/lib/env';
import { getUser } from 'models/user';
import { UserReturned } from 'types';
import { withApiHandler } from '@/lib/middleware';

async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
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

export default withApiHandler(handler);

const handlePUT = async (req: NextApiRequest, res: NextApiResponse) => {
  const allowEmailChange = env.confirmEmail === false;
  const session = await getSession(req, res);

  if (!session) {
    throw new ApiError(401, 'Unauthorized');
  }

  const toUpdate = {};

  if (
    'firstName' in req.body &&
    typeof req.body.firstName === 'string' &&
    'lastName' in req.body &&
    typeof req.body.lastName === 'string'
  ) {
    toUpdate['firstName'] = req.body.firstName.trim();
    toUpdate['lastName'] = req.body.lastName.trim();
    toUpdate['name'] =
      `${req.body.firstName.trim()} ${req.body.lastName.trim()}`;
  }

  // Only allow email change if confirmEmail is false
  if (
    'email' in req.body &&
    typeof req.body.email === 'string' &&
    allowEmailChange
  ) {
    const user = await getUser({ email: req.body.email.trim() });

    if (user && user.id !== session?.user.id) {
      throw new ApiError(400, 'Email already in use.');
    }

    toUpdate['email'] = req.body.email.trim();
  }

  if ('image' in req.body && typeof req.body.image === 'string') {
    toUpdate['image'] = req.body.image.trim();
  }

  if (Object.keys(toUpdate).length === 0) {
    throw new ApiError(400, 'Invalid request');
  }

  const user = await prisma.user.update({
    where: { id: session?.user.id },
    data: toUpdate,
  });

  console.log(`[User] profile updated, userId: ${user.id}, fields: ${Object.keys(toUpdate).join(',')}`);

  recordMetric('user.updated');

  res.status(200).json({
    data: {
      name: user.name,
      firstName: user.firstName,
      lastName: user.lastName,
    } as UserReturned,
  });
};
