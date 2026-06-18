import {
  getSbomReportsWithDetails,
  createSbomReportWithJob,
} from '@oscrat/model/operations';
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

// GET: List all SBOM reports for a version
const handleGET = async (
  req: AuthenticatedTeamRequest,
  res: NextApiResponse
) => {
  const { teamMember } = req.teamContext;
  const { versionId } = req.query;

  const reports = await getSbomReportsWithDetails(
    prisma,
    teamMember.teamId,
    versionId as string
  );

  console.log(
    `[SBOM Reports API] Listed reports, teamId: ${teamMember.teamId}, versionId: ${versionId}, count: ${reports.length}`
  );

  res.status(200).json({ data: reports });
};

// POST: Create a new repository-based SBOM generation report
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

  const report = await createSbomReportWithJob(
    prisma,
    {
      versionId: versionId as string,
      productId: productId as string,
      jobType: 'REPO_GENERATE_SBOM',
      jobPayload: { repositoryId },
      triggeredByUserId: teamMember.userId,
      teamId: teamMember.teamId,
    },
    req.auditInfo
  );

  console.log(
    `[SBOM Reports API] Created repo-based SBOM report, teamId: ${teamMember.teamId}, reportId: ${report.id}, repositoryId: ${repositoryId}`
  );

  res.status(201).json({ data: report });
};
