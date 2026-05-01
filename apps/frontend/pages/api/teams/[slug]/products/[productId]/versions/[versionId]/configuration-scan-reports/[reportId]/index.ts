import {
  deleteConfigurationScanReport,
  getConfigurationScanReportDetailsById,
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
    case 'DELETE':
      return withTeamAuth(['team', 'update'])(handleDELETE)(req, res);
    default:
      res.setHeader('Allow', ['GET', 'DELETE']);
      throw new ApiError(405, `Method ${method} Not Allowed`);
  }
}

const handleGET = async (
  req: AuthenticatedTeamRequest,
  res: NextApiResponse
) => {
  const { teamMember } = req.teamContext;
  const { reportId } = req.query;

  if (!reportId) {
    throw new ApiError(400, 'Report ID is required');
  }

  const report = await getConfigurationScanReportDetailsById(
    prisma,
    teamMember.teamId,
    reportId as string
  );

  if (!report) {
    throw new ApiError(404, 'Configuration scan report not found');
  }

  console.log(
    `[Configuration Scan Reports API] Retrieved report: reportId: ${reportId}, teamId: ${teamMember.teamId}`
  );

  res.status(200).json({ data: report });
};

const handleDELETE = async (
  req: AuthenticatedTeamRequest,
  res: NextApiResponse
) => {
  const { teamMember } = req.teamContext;
  const { reportId } = req.query;

  if (!reportId) {
    throw new ApiError(400, 'Report ID is required');
  }

  await deleteConfigurationScanReport(
    prisma,
    teamMember.teamId,
    reportId as string,
    req.auditInfo
  );

  console.log(
    `[Configuration Scan Reports API] Deleted report: reportId: ${reportId}, teamId: ${teamMember.teamId}`
  );

  res.status(200).json({ success: true });
};
