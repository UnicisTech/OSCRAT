import { setCscStatus } from 'models/team';
import { withTeamAuth, type AuthenticatedTeamRequest } from '@/lib/middleware';
import type { NextApiResponse } from 'next';

export default function handler(
  req: AuthenticatedTeamRequest,
  res: NextApiResponse
) {
  const { method } = req;

  switch (method) {
    case 'PUT':
      return withTeamAuth(['team', 'read'])(handlePUT)(req, res);
    default:
      res.setHeader('Allow', ['GET', 'DELETE', 'PUT']);
      res.status(405).json({
        data: null,
        error: { message: `Method ${method} Not Allowed` },
      });
  }
}

const handlePUT = async (req: AuthenticatedTeamRequest, res: NextApiResponse) => {
  const { teamMember } = req.teamContext;

  const { slug } = req.query;
  const { control, value } = req.body;

  const statuses = await setCscStatus({
    slug: slug as string,
    control: control as string,
    value: value as string,
  });

  return res.status(200).json({ data: { statuses }, error: null });
};
