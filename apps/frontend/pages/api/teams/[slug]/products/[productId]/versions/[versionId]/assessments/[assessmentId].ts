import { prisma } from '@/lib/prisma';
import {
  getVersionAssessmentDetail,
  deleteVersionAssessment,
} from '@oscrat/model/operations';
import { withTeamAuth, type AuthenticatedTeamRequest } from '@/lib/middleware';
import type { NextApiResponse } from 'next';

export default function handler(
  req: AuthenticatedTeamRequest,
  res: NextApiResponse
) {
  const { method } = req;

  switch (method) {
    case 'GET':
      return withTeamAuth(['team', 'read'])(handleGET)(req, res);
    case 'DELETE':
      return withTeamAuth(['team', 'delete'])(handleDELETE)(req, res);
    default:
      res.setHeader('Allow', ['GET', 'DELETE']);
      res.status(405).json({
        error: { message: `Method ${method} Not Allowed` },
      });
  }
}

// Get assessment detail
const handleGET = async (
  req: AuthenticatedTeamRequest,
  res: NextApiResponse
) => {
  const { teamMember } = req.teamContext;

  const { versionId, assessmentId } = req.query;

  const assessment = await getVersionAssessmentDetail(
    prisma,
    teamMember.teamId,
    versionId as string,
    assessmentId as string
  );

  if (!assessment) {
    return res.status(404).json({
      error: { message: 'Assessment not found' },
    });
  }

  res.status(200).json({ data: assessment });
};

// Delete assessment
const handleDELETE = async (
  req: AuthenticatedTeamRequest,
  res: NextApiResponse
) => {
  const { teamMember } = req.teamContext;

  const { versionId, assessmentId } = req.query;

  await deleteVersionAssessment(
    prisma,
    teamMember.teamId,
    versionId as string,
    assessmentId as string
  );

  res.status(200).json({ data: {} });
};
