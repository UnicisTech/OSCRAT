import jackson from '@/lib/jackson';
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

const handlePOST = async (req: NextApiRequest, res: NextApiResponse) => {
  const { oauthController } = await jackson();

  const token = await oauthController.token(req.body);
  console.log('[OAuth] token issued');

  res.json(token);
};

export default withApiHandler(handler);
