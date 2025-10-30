import { prisma } from '@/lib/prisma';
import { getAssessments } from '@oscrat/model/operations';
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

// Get all assessments for a product
const handleGET = async (
  req: AuthenticatedTeamRequest,
  res: NextApiResponse
) => {
  const { teamMember } = req.teamContext;
  const { productId } = req.query;

  if (!productId || typeof productId !== 'string') {
    res.status(400).json({
      error: { message: 'Product ID is required' },
    });
    return;
  }

  const assessments = await getAssessments(
    prisma,
    teamMember.teamId,
    productId
  );

  res.status(200).json({ data: assessments });
};

