import { createTask, getTeamTasks } from 'models/task';
import { withTeamAuth, type AuthenticatedTeamRequest } from '@/lib/middleware';
import type { NextApiResponse } from 'next';
import { ApiError } from '@/lib/errors';
import {
  DEFAULT_TASK_STATUS,
  DEFAULT_TASK_ORIGIN_TYPE,
} from '@/constants/taskStatuses';
import { createTaskCreateSchema } from '@/lib/validation/task';
import { parseBody } from '@/lib/validation/validateRequest';

export default function handler(
  req: AuthenticatedTeamRequest,
  res: NextApiResponse
) {
  const { method } = req;

  switch (method) {
    case 'POST':
      return withTeamAuth(['task', 'create'])(handlePOST)(req, res);
    case 'GET':
      return withTeamAuth(['task', 'read'])(handleGET)(req, res);
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      throw new ApiError(405, `Method ${method} Not Allowed`);
  }
}

// Get team tasks
const handleGET = async (
  req: AuthenticatedTeamRequest,
  res: NextApiResponse
) => {
  const { teamMember } = req.teamContext;

  const tasks = await getTeamTasks(teamMember.teamSlug);

  return res.status(200).json({ data: tasks, error: null });
};

// Create a task
const handlePOST = async (
  req: AuthenticatedTeamRequest,
  res: NextApiResponse
) => {
  const { teamMember, user } = req.teamContext;
  const { teamId } = teamMember;

  const {
    title,
    titleLocId,
    status,
    duedate,
    description,
    descriptionLocId,
    productId,
    versionId,
    originType,
    taskType,
    properties,
  } = await parseBody(createTaskCreateSchema(), req);

  const task = await createTask(
    {
      authorId: user.id,
      teamId,
      title: title || '',
      titleLocId,
      status: status || DEFAULT_TASK_STATUS,
      duedate: duedate.toISOString(),
      description: description || '',
      descriptionLocId,
      productId: productId || undefined,
      versionId: versionId || undefined,
      originType: originType || DEFAULT_TASK_ORIGIN_TYPE,
      taskType,
      properties,
    },
    req.auditInfo
  );

  return res.status(200).json({ data: task, error: null });
};
