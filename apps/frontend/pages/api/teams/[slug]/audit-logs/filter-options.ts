import { prisma } from '@/lib/prisma';
import { getAuditLogFilterOptions } from '@oscrat/model/operations';
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
      return withTeamAuth(['team_audit_log', 'read'])(handleGET)(req, res);
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

  const filterOptions = await getAuditLogFilterOptions(prisma, teamMember.teamId);

  res.status(200).json({ data: filterOptions });
};
