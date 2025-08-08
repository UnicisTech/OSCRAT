import { getProjectDetail, updateProject, deleteProject } from 'models/oscrat';
import { withAuth, type AuthenticatedRequest } from '@/lib/middleware';
import type { NextApiResponse } from 'next';
import type { OscratProductUpdate } from '@oscrat/model';
import { ApiError } from '@/lib/errors';

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
      throw new ApiError(405, `Method ${method} Not Allowed`);
  }
}

// Get project detail
const handleGET = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  const { teamMember } = req.teamContext;

  const { productId } = req.query;

  const project = await getProjectDetail(
    teamMember.teamId,
    productId as string
  );

  if (!project) {
    throw new ApiError(404, 'Project not found');
  }

  res.status(200).json({ data: project });
};

// Update project
const handlePUT = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  const { teamMember } = req.teamContext;

  const { productId } = req.query;
  const projectData = req.body as OscratProductUpdate;

  const project = await updateProject(
    teamMember.teamId,
    productId as string,
    projectData
  );

  res.status(200).json({ data: project });
};

// Delete project
const handleDELETE = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  const { teamMember } = req.teamContext;

  const { productId } = req.query;

  await deleteProject(teamMember.teamId, productId as string);

  console.log(`[OSCRAT] project deleted, productId: ${productId}, teamId: ${teamMember.teamId}`);

  res.status(200).json({ data: {} });
};
