import { getConfigurationScanReportsWithDetails } from '@oscrat/model/operations';
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
    default:
      res.setHeader('Allow', ['GET']);
      throw new ApiError(405, `Method ${method} Not Allowed`);
  }
}

// GET: List all configuration scan reports for a version
const handleGET = async (
  req: AuthenticatedTeamRequest,
  res: NextApiResponse
) => {
  const { teamMember } = req.teamContext;
  const { versionId } = req.query;

  const reports = await getConfigurationScanReportsWithDetails(
    prisma,
    teamMember.teamId,
    versionId as string
  );

  console.log(
    `[Configuration Scan Reports API] Listed reports, teamId: ${teamMember.teamId}, versionId: ${versionId}, count: ${reports.length}`
  );

  res.status(200).json({ data: reports });
};
