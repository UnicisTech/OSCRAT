import {
  getVersionWorkerJobs,
  createWorkerJob,
} from '@oscrat/model/operations';
import { prisma } from '@/lib/prisma';
import { throwIfNoTeamAccess } from 'models/team';
import { throwIfNotAllowed } from 'models/user';
import type { NextApiRequest, NextApiResponse } from 'next';
import { WorkerJobType, type RepoGenerateSbomPayload } from '@oscrat/model';

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

    res.status(status).json({ error: { message } });
  }
}

// Get SBOM jobs for a version
const handleGET = async (req: NextApiRequest, res: NextApiResponse) => {
  const teamMember = await throwIfNoTeamAccess(req, res);
  throwIfNotAllowed(teamMember, 'team', 'read');

  const { versionId } = req.query;

  const jobs = await getVersionWorkerJobs(
    prisma,
    teamMember.teamId,
    versionId as string,
    WorkerJobType.REPO_GENERATE_SBOM
  );

  console.log(
    `[SBOM Jobs API] Found ${jobs.length} SBOM jobs for version ${versionId}`
  );

  res.status(200).json({ data: jobs });
};

// Create a new SBOM generation job
const handlePOST = async (req: NextApiRequest, res: NextApiResponse) => {
  const teamMember = await throwIfNoTeamAccess(req, res);
  throwIfNotAllowed(teamMember, 'team', 'create');

  const { versionId } = req.query;
  const { repositoryId } = req.body;

  if (!repositoryId) {
    console.error(
      `[SBOM Jobs API] Missing repository ID for version ${versionId}`
    );
    return res.status(400).json({
      error: { message: 'Repository ID is required' },
    });
  }

  console.log(
    `[SBOM Jobs API] Creating SBOM job for repository ${repositoryId}`
  );

  // Create SBOM generation job payload
  const payload: RepoGenerateSbomPayload = {
    repositoryId: repositoryId as string,
  };

  const job = await createWorkerJob(prisma, {
    type: WorkerJobType.REPO_GENERATE_SBOM,
    triggeredByUserId: teamMember.userId,
    payload,
  });

  console.log(`[SBOM Jobs API] Job created successfully: ${job.id}`);

  res.status(201).json({ data: job });
};
