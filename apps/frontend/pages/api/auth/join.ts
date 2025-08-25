import { hashPassword } from '@/lib/auth';
import { generateToken } from '@/lib/common';
import { sendVerificationEmail } from '@/lib/email/sendVerificationEmail';
import { prisma } from '@/lib/prisma';
import env from '@/lib/env';
import { ApiError } from '@/lib/errors';
import { createUser, getUser } from 'models/user';
import type { NextApiRequest, NextApiResponse } from 'next';
import { recordMetric } from '@/lib/metrics';
import { getInvitation, isInvitationExpired } from 'models/invitation';
import { validateRecaptcha } from '@/lib/recaptcha';
import { withApiHandler } from '@/lib/middleware';
import { userSignupSchema } from '@/lib/validation/signup';

async function handler(req: NextApiRequest, res: NextApiResponse) {
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

// Signup the user
const handlePOST = async (req: NextApiRequest, res: NextApiResponse) => {
  // Create backend-specific schema without retypePassword
  const backendSignupSchema = userSignupSchema.omit(['retypePassword']);
  
  try {
    await backendSignupSchema.validate(req.body, { abortEarly: false });
  } catch (error) {
    if (error instanceof Error && (error as any).errors) {
      const validationErrors = (error as any).errors;
      throw new ApiError(400, `Validation failed: ${validationErrors.join(', ')}`);
    } else {
      throw new ApiError(400, `Validation failed`);
    }
  }

  const {
    firstName,
    lastName,
    email,
    password,
    inviteToken,
    recaptchaToken,
  } = req.body;
  const name = `${firstName} ${lastName}`;

  // Validate recaptcha if provided
  if (recaptchaToken) {
    try {
      await validateRecaptcha(recaptchaToken);
    } catch (error: any) {
      throw new ApiError(400, `Recaptcha validation failed: ${error.message}`);
    }
  }

  // Handle invitation if provided
  let invitation;
  if (inviteToken) {
    try {
      invitation = await getInvitation({ token: inviteToken });
      
      if (await isInvitationExpired(invitation)) {
        throw new ApiError(400, 'Invitation expired. Please request a new one.');
      }
    } catch (error: any) {
      throw new ApiError(400, `Failed to get invitation: ${error.message}`);
    }
  }

  // Use email from invitation if available, otherwise use provided email
  const emailToUse = invitation ? invitation.email : email;

  // Check if user already exists
  try {
    const existingUser = await getUser({ email: emailToUse });
    if (existingUser) {
      throw new ApiError(400, 'An user with this email already exists.');
    }
  } catch (error: any) {
    if (error.status === 400) {
      throw error; // Re-throw ApiError
    }
    throw new ApiError(500, `Failed to check existing user: ${error.message}`);
  }



  // Create user
  let user;
  try {
    user = await createUser({
      name,
      firstName,
      lastName,
      email: emailToUse,
      password: await hashPassword(password),
      emailVerified: invitation ? new Date() : null,
    });
  } catch (error: any) {
    throw new ApiError(500, `Failed to create user: ${error.message}`);
  }



  // Send account verification email
  if (env.confirmEmail && !user.emailVerified) {
    const verificationToken = await prisma.verificationToken.create({
      data: {
        identifier: user.email,
        token: generateToken(),
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    await sendVerificationEmail({ user, verificationToken });
  }

  recordMetric('user.signup');

  res.status(201).json({
    data: {
      user,
      confirmEmail: env.confirmEmail && !user.emailVerified,
    },
  });
};
