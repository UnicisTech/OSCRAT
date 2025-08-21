import { getProductDetail, updateProduct, deleteProduct } from 'models/oscrat';
import { withTeamAuth, type AuthenticatedTeamRequest } from '@/lib/middleware';
import type { NextApiResponse } from 'next';
import type { OscratProductUpdate } from '@oscrat/model';
import { ApiError } from '@/lib/errors';

export default function handler(
  req: AuthenticatedTeamRequest,
  res: NextApiResponse
) {
  const { method } = req;

  switch (method) {
    case 'GET':
      return withTeamAuth(['team', 'read'])(handleGET)(req, res);
    case 'PUT':
      return withTeamAuth(['team', 'update'])(handlePUT)(req, res);
    case 'DELETE':
      return withTeamAuth(['team', 'delete'])(handleDELETE)(req, res);
    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      throw new ApiError(405, `Method ${method} Not Allowed`);
  }
}

// Get project detail
const handleGET = async (
  req: AuthenticatedTeamRequest,
  res: NextApiResponse
) => {
  const { teamMember } = req.teamContext;

  const { productId } = req.query;

  const project = await getProductDetail(
    teamMember.teamId,
    productId as string
  );

  if (!project) {
    throw new ApiError(404, 'Project not found');
  }

  res.status(200).json({ data: project });
};

// Update project
const handlePUT = async (
  req: AuthenticatedTeamRequest,
  res: NextApiResponse
) => {
  const { teamMember } = req.teamContext;

  const { productId } = req.query;
  const projectData = req.body as OscratProductUpdate;

  const project = await updateProduct(
    teamMember.teamId,
    productId as string,
    projectData
  );

  res.status(200).json({ data: project });
};

// Delete project
const handleDELETE = async (
  req: AuthenticatedTeamRequest,
  res: NextApiResponse
) => {
  const { teamMember } = req.teamContext;

  const { productId } = req.query;

  await deleteProduct(teamMember.teamId, productId as string);

  console.log(
    `[OSCRAT] project deleted, productId: ${productId}, teamId: ${teamMember.teamId}`
  );

  res.status(200).json({ data: {} });
};
