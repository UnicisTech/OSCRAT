import { prisma } from '@/lib/prisma';
import { searchProducts } from '@oscrat/model/operations';
import { withTeamAuth, type AuthenticatedTeamRequest } from '@/lib/middleware';
import type { NextApiResponse } from 'next';
import type { OscratProductSearchRequest } from '@oscrat/model';
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

const handlePOST = async (
  req: AuthenticatedTeamRequest,
  res: NextApiResponse
) => {
  const { teamMember } = req.teamContext;
  const searchParams = req.body as OscratProductSearchRequest;

  const products = await searchProducts(
    prisma,
    teamMember.teamId,
    searchParams
  );

  res.status(200).json({ data: products });
};

