import { getVersionDetail, updateVersion, deleteVersion } from 'models/oscrat';
import { throwIfNoTeamAccess } from 'models/team';
import { throwIfNotAllowed } from 'models/user';
import type { NextApiRequest, NextApiResponse } from 'next';
import type { OscratProductVersionUpdate } from '@oscrat/model';

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

// Get version detail
const handleGET = async (req: NextApiRequest, res: NextApiResponse) => {
  const teamMember = await throwIfNoTeamAccess(req, res);
  throwIfNotAllowed(teamMember, 'team', 'read');

  const { versionId } = req.query;

  const version = await getVersionDetail(
    teamMember.teamId,
    versionId as string
  );

  if (!version) {
    return res.status(404).json({
      error: { message: 'Version not found' },
    });
  }

  res.status(200).json({ data: version });
};

// Update version
const handlePUT = async (req: NextApiRequest, res: NextApiResponse) => {
  const teamMember = await throwIfNoTeamAccess(req, res);
  throwIfNotAllowed(teamMember, 'team', 'update');

  const { versionId } = req.query;
  const versionData = req.body as OscratProductVersionUpdate;

  // Add updatedBy field from the authenticated user
  const updateData: OscratProductVersionUpdate = {
    ...versionData,
    updatedBy: teamMember.userId,
  };

  const version = await updateVersion(
    teamMember.teamId,
    versionId as string,
    updateData
  );

  res.status(200).json({ data: version });
};

// Delete version
const handleDELETE = async (req: NextApiRequest, res: NextApiResponse) => {
  const teamMember = await throwIfNoTeamAccess(req, res);
  throwIfNotAllowed(teamMember, 'team', 'delete');

  const { versionId } = req.query;

  await deleteVersion(teamMember.teamId, versionId as string);

  res.status(200).json({ data: {} });
};
