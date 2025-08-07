import { getVersions, createVersion } from 'models/oscrat';
import { withAuth, type AuthenticatedRequest } from '@/lib/middleware';
import type { NextApiResponse } from 'next';
import type { OscratProductVersionCreate } from '@oscrat/model';

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
      res.status(405).json({
        error: { message: `Method ${method} Not Allowed` },
      });
  }
}

// Get all versions for a product
const handleGET = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  const { teamMember } = req.teamContext;

  const { projectId } = req.query;

  const versions = await getVersions(teamMember.teamId, projectId as string);

  res.status(200).json({ data: versions });
};

// Create version for a product
const handlePOST = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  const { teamMember } = req.teamContext;

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
