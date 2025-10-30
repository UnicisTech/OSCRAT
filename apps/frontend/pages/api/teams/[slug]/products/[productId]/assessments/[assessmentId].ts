import { prisma } from '@/lib/prisma';
import { getAssessmentDetail } from '@oscrat/model/operations';
import { withTeamAuth, type AuthenticatedTeamRequest } from '@/lib/middleware';
import type { NextApiResponse } from 'next';

export default function handler(
  req: AuthenticatedTeamRequest,
  res: NextApiResponse
) {
  const { method } = req;

  if (method === 'GET') {
    return withTeamAuth(['team', 'read'])(handleGET)(req, res);
  }

  res.setHeader('Allow', ['GET']);
  res.status(405).json({
    error: { message: `Method ${method} Not Allowed` },
  });
}

// Get assessment detail by product ID and assessment ID
const handleGET = async (
  req: AuthenticatedTeamRequest,
  res: NextApiResponse
) => {
  const { teamMember } = req.teamContext;
  const { productId, assessmentId } = req.query;

  if (!productId || typeof productId !== 'string') {
    res.status(400).json({
      error: { message: 'Product ID is required' },
    });
    return;
  }

  if (!assessmentId || typeof assessmentId !== 'string') {
    res.status(400).json({
      error: { message: 'Assessment ID is required' },
    });
    return;
  }

  const assessment = await getAssessmentDetail(
    prisma,
    teamMember.teamId,
    productId,
    assessmentId
  );

  if (!assessment) {
    return res.status(404).json({
      error: { message: 'Assessment not found' },
    });
  }

  res.status(200).json({ data: assessment });
};

