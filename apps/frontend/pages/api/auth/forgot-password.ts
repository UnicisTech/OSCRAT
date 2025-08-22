import { generateToken, validateEmail } from '@/lib/common';
import { sendPasswordResetEmail } from '@/lib/email/sendPasswordResetEmail';
import { ApiError } from '@/lib/errors';
import { prisma } from '@/lib/prisma';
import type { NextApiRequest, NextApiResponse } from 'next';
import { recordMetric } from '@/lib/metrics';
import { validateRecaptcha } from '@/lib/recaptcha';
import rateLimit from '@/lib/rate-limit';
import { getIpAddress } from '@/lib/utils';
import { withApiHandler } from '@/lib/middleware';

const limiter = rateLimit({
  interval: 60 * 1000, // 60 seconds
  uniqueTokenPerInterval: 500, // Max 500 requests per second
});

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  try {
    await limiter.check(5, getIpAddress(req), res); // 5 requests per minute for IP address
  } catch (error: any) {
    throw new ApiError(429, 'Rate limit exceeded');
  }

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
  const { email, recaptchaToken } = req.body;

  await validateRecaptcha(recaptchaToken);

  if (!email || !validateEmail(email)) {
    throw new ApiError(422, 'The e-mail address you entered is invalid');
  }

  console.log(`[DB] findUser, email: ${email}`);
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new ApiError(422, `We can't find a user with that e-mail address`);
  }

  const resetToken = generateToken();

  await prisma.passwordReset.create({
    data: {
      email,
      token: resetToken,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000), // Expires in 1 hour
    },
  });

  await sendPasswordResetEmail(email, encodeURIComponent(resetToken));

  recordMetric('user.password.request');

  res.json({});
};
