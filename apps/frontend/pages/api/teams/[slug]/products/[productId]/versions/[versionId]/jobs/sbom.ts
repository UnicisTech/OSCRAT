import {
  getVersionWorkerJobs,
  createWorkerJob,
} from '@oscrat/model/operations';
import { prisma } from '@/lib/prisma';
import { withAuth, type AuthenticatedRequest } from '@/lib/middleware';
import type { NextApiResponse } from 'next';
import { WorkerJobType, type RepoGenerateSbomPayload } from '@oscrat/model';
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

// Get SBOM jobs for a version
const handleGET = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  const { teamMember } = req.teamContext;

  const { versionId } = req.query;

  const jobs = await getVersionWorkerJobs(
    prisma,
    teamMember.teamId,
    versionId as string,
    WorkerJobType.REPO_GENERATE_SBOM
  );

  console.log(`[SBOM] jobs listed, versionId: ${versionId}, count: ${jobs.length}`);

  res.status(200).json({ data: jobs });
};

// Create a new SBOM generation job
const handlePOST = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  const { teamMember } = req.teamContext;

  const { versionId } = req.query;
  const { repositoryId } = req.body;

  if (!repositoryId) {
    throw new ApiError(400, 'Repository ID is required');
  }

  // Create SBOM generation job payload
  const payload: RepoGenerateSbomPayload = {
    repositoryId: repositoryId as string,
  };

  const job = await createWorkerJob(prisma, {
    type: WorkerJobType.REPO_GENERATE_SBOM,
    triggeredByUserId: teamMember.userId,
    payload,
  });

  console.log(`[SBOM] job created, jobId: ${job.id}, repositoryId: ${repositoryId}, versionId: ${versionId}, triggeredBy: ${teamMember.userId}`);

  res.status(201).json({ data: job });
};
