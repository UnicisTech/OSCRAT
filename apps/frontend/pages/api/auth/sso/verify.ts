import env from '@/lib/env';
import jackson from '@/lib/jackson';
import { getTeam } from 'models/team';
import { NextApiRequest, NextApiResponse } from 'next';
import { withApiHandler } from '@/lib/middleware';
import { ApiError } from '@/lib/errors';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  switch (method) {
    case 'POST':
      await handlePOST(req, res);
      break;
    default:
      res.setHeader('Allow', 'POST');
      throw new ApiError(405, `Method ${method} Not Allowed`);
  }
}

export default withApiHandler(handler);

const handlePOST = async (req: NextApiRequest, res: NextApiResponse) => {
  const { apiController } = await jackson();

  const { slug } = JSON.parse(req.body) as { slug: string };

  if (!slug) {
    throw new ApiError(400, 'Missing the SSO identifier.');
  }

  console.log(`[Auth] SSO verify attempt, teamSlug: ${slug}`);

  console.log(`[DB] getTeam, slug: ${slug}`);
  const team = await getTeam({ slug });

  if (!team) {
    throw new ApiError(404, 'Team not found.');
  }

  const connections = await apiController.getConnections({
    tenant: team.id,
    product: env.product,
  });

  if (!connections || connections.length === 0) {
    throw new ApiError(404, 'No SSO connections found for this team.');
  }

  console.log(
    `[Auth] SSO verify success, teamId: ${team.id}, connections: ${connections.length}`
  );

  const data = {
    teamId: team.id,
  };

  res.json({ data });
};
