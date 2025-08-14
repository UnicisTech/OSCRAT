import {
  getRepositoryDetail,
  updateRepository,
  deleteRepository,
} from '@oscrat/model/operations';
import { prisma } from '@/lib/prisma';
import { withTeamAuth, type AuthenticatedTeamRequest } from '@/lib/middleware';
import type { NextApiResponse } from 'next';
import type { OscratRepositoryUpdate } from '@oscrat/model';

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

// Get repository detail
const handleGET = async (req: AuthenticatedTeamRequest, res: NextApiResponse) => {
  const { teamMember } = req.teamContext;

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
const handlePUT = async (req: AuthenticatedTeamRequest, res: NextApiResponse) => {
  const { teamMember } = req.teamContext;

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
const handleDELETE = async (req: AuthenticatedTeamRequest, res: NextApiResponse) => {
  const { teamMember } = req.teamContext;

  const { repositoryId } = req.query;

  await deleteRepository(prisma, teamMember.teamId, repositoryId as string);

  res.status(200).json({ data: {} });
};
