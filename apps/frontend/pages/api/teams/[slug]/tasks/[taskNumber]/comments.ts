import {
  createComment,
  updateComment,
  deleteComment,
  getComments,
} from 'models/comment';
import { withAuth, type AuthenticatedRequest } from '@/lib/middleware';
import type { NextApiResponse } from 'next';
import { sendEvent } from '@/lib/svix';

export default function handler(
  req: AuthenticatedRequest,
  res: NextApiResponse
) {
  const { method } = req;

  switch (method) {
    case 'GET':
      return withAuth(['task', 'read'])(handleGET)(req, res);
    case 'POST':
      return withAuth(['task', 'update'])(handlePOST)(req, res);
    case 'PUT':
      return withAuth(['task', 'update'])(handlePUT)(req, res);
    case 'DELETE':
      return withAuth(['task', 'update'])(handleDELETE)(req, res);
    default:
      res.setHeader('Allow', ['GET', 'POST', 'DELETE', 'PUT']);
      res.status(405).json({
        data: null,
        error: { message: `Method ${method} Not Allowed` },
      });
  }
}

// Get comments for a task
const handleGET = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  const { teamMember } = req.teamContext;

  const { slug, taskNumber } = req.query;
  const taskNumberAsNumber = Number(taskNumber);

  if (isNaN(taskNumberAsNumber)) {
    return res.status(400).json({
      error: {
        message: 'Invalid task number',
      },
    });
  }

  const comments = await getComments({
    taskNumber: taskNumberAsNumber,
    slug: slug as string,
  });

  return res.status(200).json({ data: comments, error: null });
};

// Create a comment
const handlePOST = async (req: AuthenticatedRequest, res: NextApiResponse) => {
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

  const { text } = req.body;
  const userId = user.id;

  const comment = await createComment({
    text,
    taskNumber: taskNumberAsNumber,
    slug: slug as string,
    userId,
  });

  if (!comment) {
    return res.status(400).json({
      error: {
        message: 'Comment not created',
      },
    });
  }

  await sendEvent(teamMember.teamId, 'task.commented', comment);

  return res.status(200).json({ data: comment, error: null });
};

// Edit a comment
const handlePUT = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  const { teamMember } = req.teamContext;

  const { text, id } = req.body;

  const comment = await updateComment(id, text);

  if (!comment) {
    return res.status(503).json({
      error: {
        message: 'Comment is not updated.',
      },
    });
  }

  return res.status(200).json({ data: comment, error: null });
};

// Delete a comment
const handleDELETE = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  const { teamMember } = req.teamContext;

  const { id } = req.body;

  const comment = await deleteComment(id);

  if (!comment) {
    return res.status(400).json({
      error: {
        message: 'Comment not deleted',
      },
    });
  }

  return res.status(200).json({ data: {}, error: null });
};
