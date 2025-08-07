import { sendEvent } from '@/lib/svix';
import { createTask, getTeamTasks } from 'models/task';
import { withAuth, type AuthenticatedRequest } from '@/lib/middleware';
import type { NextApiResponse } from 'next';

export default function handler(
  req: AuthenticatedRequest,
  res: NextApiResponse
) {
  const { method } = req;

  switch (method) {
    case 'POST':
      return withAuth(['task', 'create'])(handlePOST)(req, res);
    case 'GET':
      return withAuth(['task', 'read'])(handleGET)(req, res);
    default:
      res.setHeader('Allow', ['GET', 'DELETE', 'PUT']);
      res.status(405).json({
        data: null,
        error: { message: `Method ${method} Not Allowed` },
      });
  }
}

// Get team tasks
const handleGET = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  const { teamMember } = req.teamContext;

  const tasks = await getTeamTasks(teamMember.team.slug as string);

  return res.status(200).json({ data: tasks, error: null });
};

// Create a task
const handlePOST = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  const { teamMember, user } = req.teamContext;

  const { title, status, duedate, description } = req.body;
  const {
    teamId,
  } = teamMember;

  const task = await createTask({
    authorId: user.id,
    teamId,
    title,
    status,
    duedate,
    description,
  });

  await sendEvent(teamMember.teamId, 'task.created', task);

  return res.status(200).json({ data: {}, error: null });
};
