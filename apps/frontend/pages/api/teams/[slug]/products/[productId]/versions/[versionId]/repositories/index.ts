import {
  getVersionRepository,
  createRepository,
} from '@oscrat/model/operations';
import { prisma } from '@/lib/prisma';
import { withAuth, type AuthenticatedRequest } from '@/lib/middleware';
import type { NextApiResponse } from 'next';
import type { OscratRepositoryCreate } from '@oscrat/model';
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

// Get repository for a version
const handleGET = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  const { teamMember } = req.teamContext;

  const { versionId } = req.query;

  const repository = await getVersionRepository(
    prisma,
    teamMember.teamId,
    versionId as string
  );

  console.log(
    `[Repository API] Repository ${repository ? 'found' : 'not found'} for version ${versionId}`
  );

  res.status(200).json({ data: repository });
};

// Create a new repository
const handlePOST = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  const { teamMember } = req.teamContext;

  const { versionId } = req.query;
  const repositoryData = req.body as OscratRepositoryCreate;

  const repository = await createRepository(
    prisma,
    teamMember.teamId,
    versionId as string,
    repositoryData
  );

  console.log(`[OSCRAT] repository created, repositoryId: ${repository.id}, name: ${repositoryData.name}, versionId: ${versionId}`);

  res.status(201).json({ data: repository });
};
