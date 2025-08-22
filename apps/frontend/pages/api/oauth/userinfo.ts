import { ApiError } from '@/lib/errors';
import jackson from '@/lib/jackson';
import { NextApiRequest, NextApiResponse } from 'next';
import { withApiHandler } from '@/lib/middleware';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  switch (method) {
    case 'GET':
      await handleGET(req, res);
      break;
    default:
      res.setHeader('Allow', 'GET');
      throw new ApiError(405, `Method ${method} Not Allowed`);
  }
}

export default withApiHandler(handler);

const handleGET = async (req: NextApiRequest, res: NextApiResponse) => {
  const { oauthController } = await jackson();

  let token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    let arr: string[] = [];
    arr = arr.concat(req.query.access_token || '');

    if (arr[0].length > 0) {
      token = arr[0];
    }
  }

  if (!token) {
    console.log(`[Auth] OAuth userinfo failed, error: missing token`);
    throw new ApiError(401, 'Unauthorized');
  }

  console.log(`[Auth] OAuth userinfo request, tokenPresent: true`);

  const profile = await oauthController.userInfo(token);

  console.log(
    `[Auth] OAuth userinfo success, userId: ${profile.id || 'unknown'}`
  );

  res.json(profile);
};
