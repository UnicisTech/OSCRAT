import {
  getInvitation,
  isInvitationExpired,
  deleteInvitation,
} from 'models/invitation';
import { addTeamMember } from 'models/team';
import { ensureAwarenessTrainingTask } from 'models/task';
import type { NextApiRequest, NextApiResponse } from 'next';
import { recordMetric } from '@/lib/metrics';
import { ApiError } from '@/lib/errors';
import { withApiHandler } from '@/lib/middleware';
import { getSession } from '@/lib/session';
import { sendEvent } from '@/lib/svix';
import { toPlainObject } from '@/lib/utils';

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

// Accept an invitation
const handlePOST = async (req: NextApiRequest, res: NextApiResponse) => {
  const { token } = req.query as { token: string };

  const invitation = await getInvitation({ token });

  if (!invitation) {
    throw new ApiError(404, 'Invitation not found.');
  }
  if (await isInvitationExpired(invitation)) {
    throw new ApiError(400, 'Invitation expired. Please request a new one.');
  }
  const session = await getSession(req, res);
  const userId = session?.user?.id as string;

  if (!session || !userId) {
    throw new ApiError(401, 'You must be logged in to accept an invitation.');
  }

  if (session?.user.email != invitation.email) {
    throw new ApiError(
      400,
      'You must be logged in with the email address you were invited with.'
    );
  }

  const auditInfo = {
    user: { id: session.user.id, name: session.user.name },
    team: { id: invitation.team.id, name: invitation.team.name },
  };

  const teamMember = await addTeamMember(
    invitation.team.id,
    userId,
    invitation.role,
    auditInfo
  );

  ensureAwarenessTrainingTask(
    invitation.team.id,
    userId,
    session.user.name!,
    auditInfo
  ).catch((err) =>
    console.error(
      '[Awareness] Failed to create training task on invite accept:',
      err
    )
  );

  await sendEvent(
    invitation.team.id,
    'member.created',
    toPlainObject(teamMember)
  );
  await deleteInvitation({ token });

  recordMetric('member.created');

  res.status(200).json({ data: {} });
};

export default withApiHandler(handler);
