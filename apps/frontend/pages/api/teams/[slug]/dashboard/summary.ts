import { prisma } from '@/lib/prisma';
import { getTeamDashboardSummary } from '@oscrat/model/operations/dashboard';
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

const handleGET = async (
  req: AuthenticatedTeamRequest,
  res: NextApiResponse
) => {
  const { teamMember } = req.teamContext;

  const summary = await getTeamDashboardSummary(prisma, teamMember.teamId);

  res.status(200).json({ data: summary });
};
