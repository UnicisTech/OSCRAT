import { prisma } from '@/lib/prisma';
import { getVersionDetail, updateVersion, deleteVersion } from '@oscrat/model/operations';
import { withTeamAuth, type AuthenticatedTeamRequest } from '@/lib/middleware';
import type { NextApiResponse } from 'next';
import type { OscratProductVersionUpdate } from '@oscrat/model';

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
      res.status(405).json({
        error: { message: `Method ${method} Not Allowed` },
      });
  }
}

// Get version detail
const handleGET = async (
  req: AuthenticatedTeamRequest,
  res: NextApiResponse
) => {
  const { teamMember } = req.teamContext;

  const { versionId } = req.query;

  const version = await getVersionDetail(
    prisma,
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
const handlePUT = async (
  req: AuthenticatedTeamRequest,
  res: NextApiResponse
) => {
  const { teamMember } = req.teamContext;

  const { versionId } = req.query;
  const versionData = req.body as OscratProductVersionUpdate;

  // Add updatedBy field from the authenticated user
  const updateData: OscratProductVersionUpdate = {
    ...versionData,
    updatedBy: teamMember.userId,
  };

  const version = await updateVersion(
    prisma,
    teamMember.teamId,
    versionId as string,
    updateData
  );

  res.status(200).json({ data: version });
};

// Delete version
const handleDELETE = async (
  req: AuthenticatedTeamRequest,
  res: NextApiResponse
) => {
  const { teamMember } = req.teamContext;

  const { versionId } = req.query;

  await deleteVersion(prisma, teamMember.teamId, versionId as string);

  res.status(200).json({ data: {} });
};
