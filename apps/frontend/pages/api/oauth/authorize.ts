import env from '@/lib/env';
import jackson from '@/lib/jackson';
import { NextApiRequest, NextApiResponse } from 'next';
import { withApiHandler } from '@/lib/middleware';
import { ApiError } from '@/lib/errors';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!env.teamFeatures.sso) {
    throw new ApiError(404, 'Not Found');
  }

  const { method } = req;

  switch (method) {
    case 'GET':
    case 'POST':
      await handleAuthorize(req, res);
      break;
    default:
      res.setHeader('Allow', 'GET, POST');
      throw new ApiError(405, `Method ${method} Not Allowed`);
  }
}

const handleAuthorize = async (req: NextApiRequest, res: NextApiResponse) => {
  const { oauthController } = await jackson();

  const requestParams = req.method === 'GET' ? req.query : req.body;

  const { redirect_url, authorize_form } =
    await oauthController.authorize(requestParams);

  if (redirect_url) {
    console.log('[OAuth] authorize redirect');
    res.redirect(302, redirect_url);
  } else {
    console.log('[OAuth] authorize form displayed');
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(authorize_form);
  }
};

export default withApiHandler(handler);
