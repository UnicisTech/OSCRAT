import { getSbomWorkerJobs, createSbomJob } from '@oscrat/model/operations';
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
    case 'GET':
      return withTeamAuth(['team', 'read'])(handleGET)(req, res);
    case 'POST':
      return withTeamAuth(['team', 'create'])(handlePOST)(req, res);
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      throw new ApiError(405, `Method ${method} Not Allowed`);
  }
}

// Get SBOM jobs for a version
const handleGET = async (
  req: AuthenticatedTeamRequest,
  res: NextApiResponse
) => {
  const { slug: teamId, versionId } = req.query;

  const jobs = await getSbomWorkerJobs(
    prisma,
    teamId as string,
    versionId as string
  );

  console.log(
    `[SBOM] jobs listed, teamId: ${teamId}, versionId: ${versionId}, count: ${jobs.length}`
  );

  res.status(200).json({ data: jobs });
};

// Create a new SBOM generation job
const handlePOST = async (
  req: AuthenticatedTeamRequest,
  res: NextApiResponse
) => {
  const { teamMember } = req.teamContext;
  const { slug, versionId } = req.query;
  const { repositoryId } = req.body;

  if (!repositoryId) {
    throw new ApiError(400, 'Repository ID is required');
  }

  const job = await createSbomJob(prisma, {
    repositoryId: repositoryId as string,
    triggeredByUserId: teamMember.userId,
    teamId: teamMember.teamId,
  });

  console.log(
    `[SBOM] job created, jobId: ${job.id}, repositoryId: ${repositoryId}, teamId: ${teamMember.teamId}, versionId: ${versionId}, triggeredBy: ${teamMember.userId}`
  );

  res.status(201).json({ data: job });
};
