import { hashPassword, validatePasswordPolicy } from '@/lib/auth';
import { generateToken, slugify } from '@/lib/common';
import { sendVerificationEmail } from '@/lib/email/sendVerificationEmail';
import { prisma } from '@/lib/prisma';
import { isBusinessEmail } from '@/lib/email/utils';
import env from '@/lib/env';
import { ApiError } from '@/lib/errors';
import { createTeam, isTeamExists } from 'models/team';
import { createUser, getUser } from 'models/user';
import type { NextApiRequest, NextApiResponse } from 'next';
import { recordMetric } from '@/lib/metrics';
import { getInvitation, isInvitationExpired } from 'models/invitation';
import { validateRecaptcha } from '@/lib/recaptcha';
import { withApiHandler } from '@/lib/middleware';

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
  const {
    firstName,
    lastName,
    email,
    password,
    team,
    teamData,
    inviteToken,
    recaptchaToken,
  } = req.body;
  const name = `${firstName} ${lastName}`;

  console.log(
    `[Auth] signup started, email: ${email}, team: ${team}, hasInviteToken: ${!!inviteToken}`
  );

  console.log(`[Auth] validating recaptcha`);
  try {
    await validateRecaptcha(recaptchaToken);
    console.log(`[Auth] recaptcha validated`);
  } catch (error: any) {
    console.log(`[Auth] recaptcha validation failed, error: ${error.message}`);
    throw error;
  }

  console.log(`[Auth] checking invitation, hasInviteToken: ${!!inviteToken}`);
  let invitation;
  try {
    invitation = inviteToken
      ? await getInvitation({ token: inviteToken })
      : null;
    console.log(`[Auth] invitation fetched, valid: ${!!invitation}`);
  } catch (error: any) {
    console.log(
      `[Auth] getInvitation failed, token: ${inviteToken}, error: ${error.message}`
    );
    throw error;
  }

  if (invitation && (await isInvitationExpired(invitation))) {
    console.log(`[Auth] invitation expired, token: ${inviteToken}`);
    throw new ApiError(400, 'Invitation expired. Please request a new one.');
  }

  // If invitation is present, use the email from the invitation instead of the email in the request body
  const emailToUse = invitation ? invitation.email : email;
  console.log(
    `[Auth] using email: ${emailToUse}, fromInvitation: ${!!invitation}`
  );

  console.log(`[Auth] checking business email policy`);
  if (env.disableNonBusinessEmailSignup && !isBusinessEmail(emailToUse)) {
    console.log(`[Auth] non-business email rejected: ${emailToUse}`);
    throw new ApiError(
      400,
      `We currently only accept work email addresses for sign-up. Please use your work email to create an account. If you don't have a work email, feel free to contact our support team for assistance.`
    );
  }

  console.log(`[Auth] checking existing user, email: ${emailToUse}`);
  try {
    const existingUser = await getUser({ email: emailToUse });
    if (existingUser) {
      console.log(`[Auth] user already exists: ${emailToUse}`);
      throw new ApiError(400, 'An user with this email already exists.');
    }
    console.log(`[Auth] user doesn't exist, proceeding with signup`);
  } catch (error: any) {
    if (error.status === 400) {
      throw error; // Re-throw ApiError
    }
    console.log(
      `[Auth] getUser failed, email: ${emailToUse}, error: ${error.message}`
    );
    throw error;
  }

  console.log(`[Auth] validating password policy`);
  validatePasswordPolicy(password);

  // Check if team name is available
  if (!invitation) {
    console.log(`[Auth] checking team availability, name: ${team}`);
    if (!team) {
      throw new ApiError(400, 'A team name is required.');
    }

    const slug = slugify(team);
    try {
      const nameCollisions = await isTeamExists([{ name: team }, { slug }]);
      if (nameCollisions) {
        console.log(`[Auth] team name collision, name: ${team}, slug: ${slug}`);
        throw new ApiError(400, 'A team with this name already exists.');
      }
      console.log(`[Auth] team name available, name: ${team}, slug: ${slug}`);
    } catch (error: any) {
      if (error.status === 400) {
        throw error; // Re-throw ApiError
      }
      console.log(
        `[Auth] isTeamExists failed, name: ${team}, slug: ${slug}, error: ${error.message}`
      );
      throw error;
    }
  }

  console.log(`[Auth] creating user, email: ${emailToUse}`);
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
    console.log(
      `[Auth] user created, userId: ${user.id}, email: ${emailToUse}`
    );
  } catch (error: any) {
    console.log(
      `[Auth] createUser failed, email: ${emailToUse}, error: ${error.message}`
    );
    throw error;
  }

  if (!invitation) {
    const teamName = teamData?.name || team;
    const slug = slugify(teamName);

    console.log(
      `[Auth] creating team, name: ${teamName}, slug: ${slug}, userId: ${user.id}, enhanced: ${!!teamData}`
    );
    try {
      const nameCollisions = await isTeamExists([{ name: teamName }, { slug }]);
      if (nameCollisions) {
        console.log(
          `[Auth] team name collision, name: ${teamName}, slug: ${slug}`
        );
        throw new ApiError(400, 'A team with this name already exists.');
      }

      const teamCreateData = teamData
        ? {
            userId: user.id,
            name: teamData.name,
            slug,
            type: teamData.type,
            size: teamData.size,
            taxId: teamData.taxId,
            postalAddress: teamData.postalAddress,
            contactEmail: teamData.contactEmail,
            contactPhone: teamData.contactPhone,
            additionalInformation: teamData.additionalInformation,
          }
        : {
            userId: user.id,
            name: team,
            slug,
          };

      await createTeam(teamCreateData);
      console.log(
        `[Auth] team created successfully, name: ${teamName}, userId: ${user.id}`
      );
    } catch (error: any) {
      console.log(
        `[Auth] team creation failed, name: ${teamName}, userId: ${user.id}, error: ${error.message}`
      );
      throw error;
    }
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

  console.log(
    `[Auth] signup success, userId: ${user.id}, email: ${emailToUse}, teamCreated: ${!invitation}`
  );

  recordMetric('user.signup');

  res.status(201).json({
    data: {
      user,
      confirmEmail: env.confirmEmail && !user.emailVerified,
    },
  });
};
