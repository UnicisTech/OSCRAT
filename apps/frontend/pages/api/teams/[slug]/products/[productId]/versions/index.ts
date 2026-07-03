import { prisma } from '@/lib/prisma';
import { getVersions, createVersion } from '@oscrat/model/operations';
import { withTeamAuth, type AuthenticatedTeamRequest } from '@/lib/middleware';
import type { NextApiResponse } from 'next';
import type { OscratProductVersionCreate } from '@oscrat/model';
import { ApiError } from '@/lib/errors';
import { parseBody } from '@/lib/validation/validateRequest';
import { versionCreateSchema } from '@/lib/validation/version';

export default function handler(
  req: AuthenticatedTeamRequest,
  res: NextApiResponse
) {
  const { method } = req;

  switch (method) {
    case 'GET':
      return withTeamAuth(['team', 'read'])(handleGET)(req, res);
    case 'POST':
      return withTeamAuth(['team', 'create'])(handlePOST)(req, res);
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      throw new ApiError(405, `Method ${method} Not Allowed`);
  }
}

// Get all versions for a product
const handleGET = async (
  req: AuthenticatedTeamRequest,
  res: NextApiResponse
) => {
  const { teamMember } = req.teamContext;

  const { productId } = req.query;

  const versions = await getVersions(
    prisma,
    teamMember.teamId,
    productId as string
  );

  res.status(200).json({ data: versions });
};

// Create version for a product
const handlePOST = async (
  req: AuthenticatedTeamRequest,
  res: NextApiResponse
) => {
  const { teamMember } = req.teamContext;

  const { productId } = req.query;
  const versionData = await parseBody(versionCreateSchema, req);

  const createData: OscratProductVersionCreate = {
    ...versionData,
    productId: productId as string,
    createdBy: teamMember.userId,
  };

  const version = await createVersion(
    prisma,
    teamMember.teamId,
    createData,
    req.auditInfo
  );

  console.log(
    `[OSCRAT] version created, versionId: ${version.id}, productId: ${productId}, version: ${versionData.version}, createdBy: ${teamMember.userId}`
  );

  res.status(201).json({ data: version });
};
