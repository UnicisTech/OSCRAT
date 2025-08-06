import {
  getRepositoryDetail,
  updateRepository,
  deleteRepository,
} from '@oscrat/model/operations';
import { prisma } from '@/lib/prisma';
import { throwIfNoTeamAccess } from 'models/team';
import { throwIfNotAllowed } from 'models/user';
import type { NextApiRequest, NextApiResponse } from 'next';
import type { OscratRepositoryUpdate } from '@oscrat/model';

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

// Get repository detail
const handleGET = async (req: NextApiRequest, res: NextApiResponse) => {
  const teamMember = await throwIfNoTeamAccess(req, res);
  throwIfNotAllowed(teamMember, 'team', 'read');

  const { repositoryId } = req.query;

  const repository = await getRepositoryDetail(
    prisma,
    teamMember.teamId,
    repositoryId as string
  );

  if (!repository) {
    return res.status(404).json({
      error: { message: 'Repository not found' },
    });
  }

  res.status(200).json({ data: repository });
};

// Update repository
const handlePUT = async (req: NextApiRequest, res: NextApiResponse) => {
  const teamMember = await throwIfNoTeamAccess(req, res);
  throwIfNotAllowed(teamMember, 'team', 'update');

  const { repositoryId } = req.query;
  const repositoryData = req.body as OscratRepositoryUpdate;

  const repository = await updateRepository(
    prisma,
    teamMember.teamId,
    repositoryId as string,
    repositoryData
  );

  res.status(200).json({ data: repository });
};

// Delete repository
const handleDELETE = async (req: NextApiRequest, res: NextApiResponse) => {
  const teamMember = await throwIfNoTeamAccess(req, res);
  throwIfNotAllowed(teamMember, 'team', 'delete');

  const { repositoryId } = req.query;

  await deleteRepository(prisma, teamMember.teamId, repositoryId as string);

  res.status(200).json({ data: {} });
};
