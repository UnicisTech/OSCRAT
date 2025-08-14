import { permissions, Permission } from '@/lib/permissions';
import { withTeamAuth, type AuthenticatedTeamRequest } from '@/lib/middleware';
import type { NextApiResponse } from 'next';
import type { ApiResponse } from '@/types';

export default function handler(
  req: AuthenticatedTeamRequest,
  res: NextApiResponse
) {
  switch (req.method) {
    case 'GET':
      return withTeamAuth(['team', 'read'])(handleGET)(req, res);
    default:
      res.setHeader('Allow', 'GET');
      res.status(405).json({
        error: { message: `Method ${req.method} Not Allowed` },
      });
  }
}

// Get permissions for a team for the current user
const handleGET = async (
  req: AuthenticatedTeamRequest,
  res: NextApiResponse<ApiResponse<Permission[]>>
) => {
  const { teamMember } = req.teamContext;

  res.json({ data: permissions[teamMember.role] } as ApiResponse<Permission[]>);
};
