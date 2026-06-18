import { withTeamAuth, type AuthenticatedTeamRequest } from '@/lib/middleware';
import type { NextApiResponse } from 'next';
import { ApiError } from '@/lib/errors';
import { getDocumentationsForTask } from 'models/documentation';
import { getTaskBySlugAndNumber } from 'models/task';

export default function handler(
  req: AuthenticatedTeamRequest,
  res: NextApiResponse
) {
  const { method } = req;

  switch (method) {
    case 'GET':
      return withTeamAuth(['documentation', 'read'])(handleGET)(req, res);
    default:
      res.setHeader('Allow', ['GET']);
      throw new ApiError(405, `Method ${method} Not Allowed`);
  }
}

const handleGET = async (
  req: AuthenticatedTeamRequest,
  res: NextApiResponse
) => {
  const { teamMember } = req.teamContext;
  const { slug, taskNumber } = req.query;

  const taskNumberInt = parseInt(taskNumber as string, 10);
  if (isNaN(taskNumberInt)) {
    throw new ApiError(400, 'Invalid task number');
  }

  // Verify the task exists and belongs to this team
  const task = await getTaskBySlugAndNumber(taskNumberInt, slug as string);
  if (!task) {
    throw new ApiError(404, 'Task not found');
  }

  const documentations = await getDocumentationsForTask(
    teamMember.teamId,
    task.id
  );

  return res.status(200).json({ data: documentations, error: null });
};
