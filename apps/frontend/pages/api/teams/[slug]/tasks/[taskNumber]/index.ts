import { sendEvent } from '@/lib/svix';
import { getTaskBySlugAndNumber, updateTask, deleteTask } from 'models/task';
import { withAuth, type AuthenticatedRequest } from '@/lib/middleware';
import type { NextApiResponse } from 'next';

export default function handler(
  req: AuthenticatedRequest,
  res: NextApiResponse
) {
  const { method } = req;

  switch (method) {
    case 'GET':
      return withAuth(['task', 'read'])(handleGET)(req, res);
    case 'PUT':
      return withAuth(['task', 'update'])(handlePUT)(req, res);
    case 'DELETE':
      return withAuth(['task', 'delete'])(handleDELETE)(req, res);
    default:
      res.setHeader('Allow', ['GET', 'DELETE', 'PUT']);
      res.status(405).json({
        data: null,
        error: { message: `Method ${method} Not Allowed` },
      });
  }
}

// Get task by slug and taskNumber
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

  const task = await getTaskBySlugAndNumber(taskNumberAsNumber, slug as string);

  if (!task) {
    return res.status(404).json({
      error: {
        message: 'Task not found',
      },
    });
  }

  return res.status(200).json({ data: task, error: null });
};

// Edit a task
const handlePUT = async (req: AuthenticatedRequest, res: NextApiResponse) => {
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

  const data = req.body;
  const task = await updateTask(taskNumberAsNumber, slug as string, data);

  if (!task) {
    return res.status(404).json({
      error: {
        message: 'Task not found',
      },
    });
  }

  await sendEvent(teamMember.teamId, 'task.updated', task);

  return res.status(200).json({ data: task, error: null });
};

// Delete the task
const handleDELETE = async (req: AuthenticatedRequest, res: NextApiResponse) => {
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

  const task = await deleteTask(taskNumberAsNumber, slug as string);

  if (!task) {
    return res.status(404).json({
      error: {
        message: 'Task not found',
      },
    });
  }

  await sendEvent(teamMember.teamId, 'task.deleted', task);

  return res.status(200).json({ data: {}, error: null });
};
