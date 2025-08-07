import { setCscIso, getCscIso } from 'models/team';
import { withAuth, type AuthenticatedRequest } from '@/lib/middleware';
import type { NextApiResponse } from 'next';

export default function handler(
  req: AuthenticatedRequest,
  res: NextApiResponse
) {
  const { method } = req;

  switch (method) {
    case 'GET':
      return withAuth(['team', 'read'])(handleGET)(req, res);
    case 'PUT':
      return withAuth(['team', 'read'])(handlePUT)(req, res);
    default:
      res.setHeader('Allow', ['GET', 'DELETE', 'PUT']);
      res.status(405).json({
        data: null,
        error: { message: `Method ${method} Not Allowed` },
      });
  }
}

const handleGET = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  const { teamMember } = req.teamContext;

  const { slug } = req.query;

  const responce = await getCscIso({
    slug: slug as string,
  });

  console.log('hande get iso responce', responce);

  return res.status(200).json({ data: responce, error: null });
};

const handlePUT = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  const { teamMember } = req.teamContext;

  const { slug } = req.query;
  const { iso } = req.body;

  console.log('hande put iso slug ', { slug, iso });

  const responce = await setCscIso({
    slug: slug as string,
    iso,
  });

  console.log('hande put isoresponce ', responce);

  return res.status(200).json({ data: responce, error: null });
};
