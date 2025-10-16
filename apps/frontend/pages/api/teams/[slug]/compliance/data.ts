import { ApiError } from '@/lib/errors';
import { withTeamAuth, type AuthenticatedTeamRequest } from '@/lib/middleware';
import { getComplianceData } from '@/lib/complianceDataManager';
import { OscratOrganizationRole } from '@oscrat/model';
import type { NextApiResponse } from 'next';

export default function handler(
  req: AuthenticatedTeamRequest,
  res: NextApiResponse
) {
  const { method } = req;

  switch (method) {
    case 'GET':
      return withTeamAuth(['team', 'read'])(handleGET)(req, res);
    default:
      res.setHeader('Allow', 'GET');
      throw new ApiError(405, `Method ${method} Not Allowed`);
  }
}

const handleGET = async (
  req: AuthenticatedTeamRequest,
  res: NextApiResponse
) => {
  const role = req.query.role as OscratOrganizationRole;

  if (!role) {
    throw new ApiError(400, 'Role is required');
  }

  const data = getComplianceData(role);

  if (!data) {
    throw new ApiError(404, `Compliance data not found for role "${role}"`);
  }

  res.status(200).json({
    data,
  });
};
