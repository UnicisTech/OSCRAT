import { getProjectDetail, updateProject, deleteProject } from 'models/oscrat';
import { throwIfNoTeamAccess } from 'models/team';
import { throwIfNotAllowed } from 'models/user';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  try {
    switch (method) {
      case 'GET':
        await handleGET(req, res);
        break;
      case 'PUT':
        await handlePUT(req, res);
        break;
      case 'DELETE':
        await handleDELETE(req, res);
        break;
      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        res.status(405).json({
          error: { message: `Method ${method} Not Allowed` },
        });
    }
  } catch (error: any) {
    const message = error.message || 'Something went wrong';
    const status = error.status || 500;

    res.status(status).json({ error: { message } });
  }
}

// Get project detail
const handleGET = async (req: NextApiRequest, res: NextApiResponse) => {
  const teamMember = await throwIfNoTeamAccess(req, res);
  throwIfNotAllowed(teamMember, 'team', 'read');

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
const handlePUT = async (req: NextApiRequest, res: NextApiResponse) => {
  const teamMember = await throwIfNoTeamAccess(req, res);
  throwIfNotAllowed(teamMember, 'team', 'update');

  const { projectId } = req.query;
  const projectData = req.body;

  const project = await updateProject(
    teamMember.teamId,
    projectId as string,
    projectData
  );

  res.status(200).json({ data: project });
};

// Delete project
const handleDELETE = async (req: NextApiRequest, res: NextApiResponse) => {
  const teamMember = await throwIfNoTeamAccess(req, res);
  throwIfNotAllowed(teamMember, 'team', 'delete');

  const { projectId } = req.query;

  await deleteProject(teamMember.teamId, projectId as string);

  res.status(200).json({ data: {} });
};
