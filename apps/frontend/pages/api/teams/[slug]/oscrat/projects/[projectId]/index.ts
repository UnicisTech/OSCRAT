import { getProjectDetail, updateProject, deleteProject } from 'models/oscrat';
import { withAuth, type AuthenticatedRequest } from '@/lib/middleware';
import type { NextApiResponse } from 'next';
import type { OscratProductUpdate } from '@oscrat/model';

export default function handler(
  req: AuthenticatedRequest,
  res: NextApiResponse
) {
  const { method } = req;

  switch (method) {
    case 'GET':
      return withAuth(['team', 'read'])(handleGET)(req, res);
    case 'PUT':
      return withAuth(['team', 'update'])(handlePUT)(req, res);
    case 'DELETE':
      return withAuth(['team', 'delete'])(handleDELETE)(req, res);
    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      res.status(405).json({
        error: { message: `Method ${method} Not Allowed` },
      });
  }
}

// Get project detail
const handleGET = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  const { teamMember } = req.teamContext;

  const { projectId } = req.query;

  const project = await getProjectDetail(
    teamMember.teamId,
    projectId as string
  );

  if (!project) {
    return res.status(404).json({
      error: { message: 'Project not found' },
    });
  }

  res.status(200).json({ data: project });
};

// Update project
const handlePUT = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  const { teamMember } = req.teamContext;

  const { projectId } = req.query;
  const projectData = req.body as OscratProductUpdate;

  const project = await updateProject(
    teamMember.teamId,
    projectId as string,
    projectData
  );

  res.status(200).json({ data: project });
};

// Delete project
const handleDELETE = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  const { teamMember } = req.teamContext;

  const { projectId } = req.query;

  await deleteProject(teamMember.teamId, projectId as string);

  res.status(200).json({ data: {} });
};
