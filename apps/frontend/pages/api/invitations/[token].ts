import { getInvitation, isInvitationExpired } from 'models/invitation';
import type { NextApiRequest, NextApiResponse } from 'next';
import { recordMetric } from '@/lib/metrics';
import { ApiError } from '@/lib/errors';
import { withApiHandler } from '@/lib/middleware';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  switch (method) {
    case 'GET':
      await handleGET(req, res);
      break;
    default:
      res.setHeader('Allow', 'GET');
      throw new ApiError(405, `Method ${method} Not Allowed`);
  }
}

// Get the invitation by token
const handleGET = async (req: NextApiRequest, res: NextApiResponse) => {
  const { token } = req.query as { token: string };

  const invitation = await getInvitation({ token });

  if (await isInvitationExpired(invitation)) {
    throw new ApiError(400, 'Invitation expired. Please request a new one.');
  }

  recordMetric('invitation.fetched');
  console.log(
    `[Invitation] fetched, token: ${token}, teamId: ${invitation.teamId}`
  );

  res.status(200).json({ data: invitation });
};

export default withApiHandler(handler);
