import { getVersions, createVersion } from 'models/oscrat';
import { throwIfNoTeamAccess } from 'models/team';
import { throwIfNotAllowed } from 'models/user';
import type { NextApiRequest, NextApiResponse } from 'next';
import type { OscratProductVersionCreate } from '@oscrat/model';

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
      case 'POST':
        await handlePOST(req, res);
        break;
      default:
        res.setHeader('Allow', ['GET', 'POST']);
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

// Get all versions for a product
const handleGET = async (req: NextApiRequest, res: NextApiResponse) => {
  const teamMember = await throwIfNoTeamAccess(req, res);
  throwIfNotAllowed(teamMember, 'team', 'read');

  const { projectId } = req.query;

  const versions = await getVersions(teamMember.teamId, projectId as string);

  res.status(200).json({ data: versions });
};

// Create version for a product
const handlePOST = async (req: NextApiRequest, res: NextApiResponse) => {
  const teamMember = await throwIfNoTeamAccess(req, res);
  throwIfNotAllowed(teamMember, 'team', 'create');

  const { projectId } = req.query;
  const versionData = req.body as OscratProductVersionCreate;

  // Ensure the productId matches the URL parameter
  if (versionData.productId !== projectId) {
    return res.status(400).json({
      error: { message: 'Product ID in body must match URL parameter' },
    });
  }

  // Add createdBy field from the authenticated user
  const createData: OscratProductVersionCreate = {
    ...versionData,
    createdBy: teamMember.userId,
  };

  const version = await createVersion(teamMember.teamId, createData);

  res.status(201).json({ data: version });
};
