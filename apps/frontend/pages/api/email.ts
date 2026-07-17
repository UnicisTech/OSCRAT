import { verifyPassword } from '@/lib/auth';
import { generateToken } from '@/lib/common';
import { sendEmailChangeEmail } from '@/lib/email/sendEmailChangeEmail';
import env from '@/lib/env';
import { ApiError } from '@/lib/errors';
import { recordMetric } from '@/lib/metrics';
import { withApiHandler } from '@/lib/middleware';
import { getSession } from '@/lib/session';
import { changeEmailSchema } from '@/lib/validation/auth';
import { parseBody } from '@/lib/validation/validateRequest';
import { getUser } from 'models/user';
import {
  applyEmailChange,
  requestEmailChange,
  EmailChangeStatus,
} from 'models/emailChange';
import type { NextApiRequest, NextApiResponse } from 'next';

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

export default withApiHandler(handler);

const handlePUT = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getSession(req, res);

  if (!session) {
    throw new ApiError(401, 'Unauthorized');
  }

  const { email, currentPassword } = await parseBody(changeEmailSchema, req);
  const newEmail = email.trim().toLowerCase();

  const user = await getUser({ id: session.user.id });

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  // Re-authenticate. OAuth-only users (no password) fail here, same as on
  // password change.
  if (!(await verifyPassword(currentPassword, user.password as string))) {
    throw new ApiError(400, 'Your current password is incorrect');
  }

  if (newEmail === user.email) {
    throw new ApiError(400, 'This is already your email address.');
  }

  // Local dev (CONFIRM_EMAIL=false) has no SMTP, so apply the change immediately.
  if (env.confirmEmail === false) {
    const result = await applyEmailChange({ userId: user.id, newEmail });
    if (result.status === EmailChangeStatus.EMAIL_IN_USE) {
      throw new ApiError(400, 'Email already in use.');
    }

    recordMetric('user.email.updated');
    console.log(`[User] email updated, userId: ${user.id}`);

    res.status(200).json({ data: { email: newEmail } });
    return;
  }

  // Otherwise defer: store the pending change and email a confirmation link to
  // the NEW address. The swap happens only when that link is clicked
  // (pages/auth/confirm-email-change.tsx).
  const token = generateToken();
  const result = await requestEmailChange({
    userId: user.id,
    newEmail,
    token,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
  });
  if (result.status === EmailChangeStatus.EMAIL_IN_USE) {
    throw new ApiError(400, 'Email already in use.');
  }

  await sendEmailChangeEmail(newEmail, token);

  recordMetric('user.email.request');
  console.log(`[User] email change requested, userId: ${user.id}`);

  res.status(200).json({ data: { pendingEmail: newEmail } });
};
