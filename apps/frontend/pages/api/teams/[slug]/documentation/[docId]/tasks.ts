import { withTeamAuth, type AuthenticatedTeamRequest } from '@/lib/middleware';
import type { NextApiResponse } from 'next';
import * as Yup from 'yup';
import { ApiError } from '@/lib/errors';
import { linkDocumentationToTask, unlinkDocumentationFromTask } from 'models/documentation';

const taskLinkSchema = Yup.object({
  taskId: Yup.number().required('taskId is required').positive().integer(),
});

export default function handler(
  req: AuthenticatedTeamRequest,
  res: NextApiResponse
) {
  const { method } = req;

  switch (method) {
    case 'POST':
      return withTeamAuth(['documentation', 'update'])(handlePOST)(req, res);
    case 'DELETE':
      return withTeamAuth(['documentation', 'update'])(handleDELETE)(req, res);
    default:
      res.setHeader('Allow', ['POST', 'DELETE']);
      throw new ApiError(405, `Method ${method} Not Allowed`);
  }
}

const handlePOST = async (
  req: AuthenticatedTeamRequest,
  res: NextApiResponse
) => {
  const { teamMember } = req.teamContext;
  const { docId } = req.query;

  try {
    const { taskId } = await taskLinkSchema.validate(req.body);

    await linkDocumentationToTask(
      teamMember.teamId,
      docId as string,
      taskId,
      req.auditInfo
    );

    return res.status(200).json({ data: { success: true }, error: null });
  } catch (error) {
    if (error instanceof Yup.ValidationError) {
      throw new ApiError(400, error.message);
    }
    throw error;
  }
};

const handleDELETE = async (
  req: AuthenticatedTeamRequest,
  res: NextApiResponse
) => {
  const { teamMember } = req.teamContext;
  const { docId } = req.query;

  try {
    const { taskId } = await taskLinkSchema.validate(req.body);

    await unlinkDocumentationFromTask(
      teamMember.teamId,
      docId as string,
      taskId,
      req.auditInfo
    );

    return res.status(200).json({ data: { success: true }, error: null });
  } catch (error) {
    if (error instanceof Yup.ValidationError) {
      throw new ApiError(400, error.message);
    }
    throw error;
  }
};
