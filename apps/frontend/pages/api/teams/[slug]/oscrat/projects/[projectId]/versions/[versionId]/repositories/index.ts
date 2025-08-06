import {
  getVersionRepository,
  createRepository,
} from '@oscrat/model/operations';
import { prisma } from '@/lib/prisma';
import { throwIfNoTeamAccess } from 'models/team';
import { throwIfNotAllowed } from 'models/user';
import type { NextApiRequest, NextApiResponse } from 'next';
import type { OscratRepositoryCreate } from '@oscrat/model';

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

    console.error(`[Repository API] Error:`, error.message);

    res.status(status).json({ error: { message } });
  }
}

// Get repository for a version
const handleGET = async (req: NextApiRequest, res: NextApiResponse) => {
  const teamMember = await throwIfNoTeamAccess(req, res);
  throwIfNotAllowed(teamMember, 'team', 'read');

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
const handlePOST = async (req: NextApiRequest, res: NextApiResponse) => {
  const teamMember = await throwIfNoTeamAccess(req, res);
  throwIfNotAllowed(teamMember, 'team', 'create');

  const { versionId } = req.query;
  const repositoryData = req.body as OscratRepositoryCreate;

  console.log(
    `[Repository API] Creating repository ${repositoryData.name} for version ${versionId}`
  );

  const repository = await createRepository(
    prisma,
    teamMember.teamId,
    versionId as string,
    repositoryData
  );

  console.log(
    `[Repository API] Repository created successfully: ${repository.id}`
  );

  res.status(201).json({ data: repository });
};
