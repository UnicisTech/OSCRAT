import { getProjects, createProject } from 'models/oscrat';
import { withAuth, type AuthenticatedRequest } from '@/lib/middleware';
import type { NextApiResponse } from 'next';
import type { OscratProductCreate } from '@oscrat/model';
import { ApiError } from '@/lib/errors';

export default function handler(
  req: AuthenticatedRequest,
  res: NextApiResponse
) {
  const { method } = req;

  switch (method) {
    case 'GET':
      return withAuth(['team', 'read'])(handleGET)(req, res);
    case 'POST':
      return withAuth(['team', 'create'])(handlePOST)(req, res);
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      throw new ApiError(405, `Method ${method} Not Allowed`);
  }
}

// Get all projects
const handleGET = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  const { teamMember } = req.teamContext;

  const projects = await getProjects(teamMember.teamId);

  res.status(200).json({ data: projects });
};

// Create project
const handlePOST = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  const { teamMember } = req.teamContext;

  const projectData = req.body as OscratProductCreate;

  const project = await createProject(teamMember.teamId, projectData);

  console.log(`[OSCRAT] project created, productId: ${project.id}, name: ${projectData.name}, teamId: ${teamMember.teamId}`);

  res.status(201).json({ data: project });
};
