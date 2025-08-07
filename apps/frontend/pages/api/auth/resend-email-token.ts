import { generateToken, validateEmail } from '@/lib/common';
import { sendVerificationEmail } from '@/lib/email/sendVerificationEmail';
import { ApiError } from '@/lib/errors';
import { prisma } from '@/lib/prisma';
import type { NextApiRequest, NextApiResponse } from 'next';
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
  const { email } = req.body;

  if (!email || !validateEmail(email)) {
    throw new ApiError(422, 'The email address you entered is invalid');
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new ApiError(422, `We can't find a user with that e-mail address`);
  }

  const newVerificationToken = await prisma.verificationToken.create({
    data: {
      identifier: email,
      token: generateToken(),
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // Expires in 24 hours),
    },
  });

  await sendVerificationEmail({
    user,
    verificationToken: newVerificationToken,
  });
  res.json({});
};
