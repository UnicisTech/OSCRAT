import { deleteSbomWorkerJob } from '@oscrat/model/operations';
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
    case 'DELETE':
      return withTeamAuth(['team', 'update'])(handleDELETE)(req, res);
    default:
      res.setHeader('Allow', ['DELETE']);
      throw new ApiError(405, `Method ${method} Not Allowed`);
  }
}

// Delete SBOM job
const handleDELETE = async (
  req: AuthenticatedTeamRequest,
  res: NextApiResponse
) => {
  const { teamMember } = req.teamContext;
  const { jobId } = req.query;

  if (!jobId) {
    throw new ApiError(400, 'Job ID is required');
  }

  await deleteSbomWorkerJob(prisma, teamMember.teamId, jobId as string);

  console.log(
    `[SBOM] job deleted, teamId: ${teamMember.teamId}, jobId: ${jobId}`
  );

  res.status(200).json({ data: {}, error: null });
};
