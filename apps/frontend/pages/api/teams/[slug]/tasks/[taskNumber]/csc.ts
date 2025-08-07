import {
  addControlsToIssue,
  changeControlInIssue,
  removeControlsFromIssue,
} from 'models/team';
import { withAuth, type AuthenticatedRequest } from '@/lib/middleware';
import type { NextApiResponse } from 'next';
import type { ISO } from 'types';

export default function handler(
  req: AuthenticatedRequest,
  res: NextApiResponse
) {
  const { method } = req;

  switch (method) {
    case 'PUT':
      return withAuth(['task', 'update'])(handlePUT)(req, res);
    default:
      res.setHeader('Allow', ['GET', 'DELETE', 'PUT']);
      res.status(405).json({
        data: null,
        error: { message: `Method ${method} Not Allowed` },
      });
  }
}

const handlePUT = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  const { teamMember, user } = req.teamContext;

  const { slug, taskNumber } = req.query;

  const taskNumberAsNumber = Number(taskNumber);

  if (isNaN(taskNumberAsNumber)) {
    return res.status(400).json({
      error: {
        message: 'Invalid task number',
      },
    });
  }

  const { operation, controls, ISO } = req.body;

  if (operation === 'add') {
    await addControlsToIssue({
      user: user,
      taskNumber: taskNumberAsNumber,
      slug: slug as string,
      controls,
      ISO: ISO as ISO,
    });
  }

  if (operation === 'remove') {
    await removeControlsFromIssue({
      user: user,
      taskNumber: taskNumberAsNumber,
      slug: slug as string,
      controls,
      ISO: ISO as ISO,
    });
  }

  if (operation === 'change') {
    await changeControlInIssue({
      user: user,
      taskNumber: taskNumberAsNumber,
      slug: slug as string,
      controls,
      ISO: ISO as ISO,
    });
  }

  return res.status(200).json({ data: {}, error: null });
};
