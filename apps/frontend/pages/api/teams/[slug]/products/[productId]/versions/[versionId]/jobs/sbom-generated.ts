import { createSbomJob } from '@oscrat/model/operations';
import { prisma } from '@/lib/prisma';
import { withTeamAuth, type AuthenticatedTeamRequest } from '@/lib/middleware';
import type { NextApiResponse } from 'next';
import { ApiError } from '@/lib/errors';

export default function handler(
  req: AuthenticatedTeamRequest,
  res: NextApiResponse
) {
  const { method } = req;

  switch (method) {
    case 'POST':
      return withTeamAuth(['team', 'create'])(handlePOST)(req, res);
    default:
      res.setHeader('Allow', ['POST']);
      throw new ApiError(405, `Method ${method} Not Allowed`);
  }
}

// Create a new repository-based SBOM generation job
const handlePOST = async (
  req: AuthenticatedTeamRequest,
  res: NextApiResponse
) => {
  const { teamMember } = req.teamContext;
  const { slug, productId, versionId } = req.query;
  const { repositoryId } = req.body;

  if (!repositoryId) {
    throw new ApiError(400, 'Repository ID is required');
  }

  const job = await createSbomJob(prisma, {
    repositoryId: repositoryId as string,
    triggeredByUserId: teamMember.userId,
    teamId: teamMember.teamId,
    productId: productId as string,
    versionId: versionId as string,
  });

  console.log(
    `[SBOM Generated] job created, jobId: ${job.id}, repositoryId: ${repositoryId}, teamId: ${teamMember.teamId}, versionId: ${versionId}, triggeredBy: ${teamMember.userId}`
  );

  res.status(201).json({ data: job });
};
