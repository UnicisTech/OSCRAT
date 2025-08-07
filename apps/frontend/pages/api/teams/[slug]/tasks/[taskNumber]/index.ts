import { sendEvent } from '@/lib/svix';
import { getTaskBySlugAndNumber, updateTask, deleteTask } from 'models/task';
import { withAuth, type AuthenticatedRequest } from '@/lib/middleware';
import type { NextApiResponse } from 'next';
import { ApiError } from '@/lib/errors';

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
      throw new ApiError(405, `Method ${method} Not Allowed`);
  }
}

// Get task by slug and taskNumber
const handleGET = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  const { teamMember } = req.teamContext;

  const { slug, taskNumber } = req.query;
  const taskNumberAsNumber = Number(taskNumber);

  if (isNaN(taskNumberAsNumber)) {
    throw new ApiError(400, 'Invalid task number');
  }

  const task = await getTaskBySlugAndNumber(taskNumberAsNumber, slug as string);

  if (!task) {
    throw new ApiError(404, 'Task not found');
  }

  return res.status(200).json({ data: task, error: null });
};

// Edit a task
const handlePUT = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  const { teamMember } = req.teamContext;

  const { slug, taskNumber } = req.query;
  const taskNumberAsNumber = Number(taskNumber);

  if (isNaN(taskNumberAsNumber)) {
    throw new ApiError(400, 'Invalid task number');
  }

  const data = req.body;
  const task = await updateTask(taskNumberAsNumber, slug as string, data);

  if (!task) {
    throw new ApiError(404, 'Task not found');
  }

  await sendEvent(teamMember.teamId, 'task.updated', task);

  console.log(`[Task] updated, taskId: ${task.id}, taskNumber: ${taskNumber}, teamId: ${teamMember.teamId}`);

  return res.status(200).json({ data: task, error: null });
};

// Delete the task
const handleDELETE = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  const { teamMember } = req.teamContext;

  const { slug, taskNumber } = req.query;

  const taskNumberAsNumber = Number(taskNumber);

  if (isNaN(taskNumberAsNumber)) {
    throw new ApiError(400, 'Invalid task number');
  }

  const task = await deleteTask(taskNumberAsNumber, slug as string);

  if (!task) {
    throw new ApiError(404, 'Task not found');
  }

  await sendEvent(teamMember.teamId, 'task.deleted', task);

  console.log(`[Task] deleted, taskId: ${task.id}, taskNumber: ${taskNumber}, teamId: ${teamMember.teamId}`);

  return res.status(200).json({ data: {}, error: null });
};
