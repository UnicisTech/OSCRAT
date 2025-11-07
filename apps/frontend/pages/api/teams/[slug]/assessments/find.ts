import { prisma } from '@/lib/prisma';
import { getAssessments } from '@oscrat/model/operations/assessment';
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
      return withTeamAuth(['team', 'read'])(handlePOST)(req, res);
    default:
      res.setHeader('Allow', ['POST']);
      throw new ApiError(405, `Method ${method} Not Allowed`);
  }
}

// Find assessments with filters
const handlePOST = async (
  req: AuthenticatedTeamRequest,
  res: NextApiResponse
) => {
  const { teamMember } = req.teamContext;
  const { productId, versionId } = req.body;

  const assessments = await getAssessments(
    prisma,
    teamMember.teamId,
    productId,
    versionId
  );

  res.status(200).json({ data: assessments });
};
