import env from '@/lib/env';
import jackson from '@/lib/jackson';
import { withTeamAuth, type AuthenticatedTeamRequest } from '@/lib/middleware';
import { sendAudit } from '@/lib/retraced';
import type { NextApiResponse } from 'next';
import { ApiError } from '@/lib/errors';

export default function handler(
  req: AuthenticatedTeamRequest,
  res: NextApiResponse
) {
  const { method } = req;

  if (!env.teamFeatures.dsync) {
    throw new ApiError(404, 'Not Found');
  }

  switch (method) {
    case 'GET':
      return withTeamAuth(['team_dsync', 'read'])(handleGET)(req, res);
    case 'POST':
      return withTeamAuth(['team_dsync', 'create'])(handlePOST)(req, res);
    case 'DELETE':
      return withTeamAuth(['team_dsync', 'delete'])(handleDELETE)(req, res);
    default:
      res.setHeader('Allow', 'GET, POST');
      res.status(405).json({
        error: { message: `Method ${method} Not Allowed` },
      });
  }
}

const handleGET = async (
  req: AuthenticatedTeamRequest,
  res: NextApiResponse
) => {
  const { teamMember } = req.teamContext;

  const { directorySync } = await jackson();

  const { data, error } = await directorySync.directories.getByTenantAndProduct(
    teamMember.teamId,
    env.product
  );

  if (error) {
    throw error;
  }

  res.status(200).json({ data });
};

const handlePOST = async (
  req: AuthenticatedTeamRequest,
  res: NextApiResponse
) => {
  const { teamMember, user } = req.teamContext;

  const { name, provider } = req.body;

  const { directorySync } = await jackson();

  const { data, error } = await directorySync.directories.create({
    name,
    type: provider,
    tenant: teamMember.teamId,
    product: env.product,
  });

  if (error) {
    throw error;
  }

  sendAudit({
    action: 'dsync.connection.create',
    crud: 'c',
    user: user,
    team: { id: teamMember.teamId, name: teamMember.teamName },
  });

  res.status(201).json({ data });
};

const handleDELETE = async (
  req: AuthenticatedTeamRequest,
  res: NextApiResponse
) => {
  const { teamMember, user } = req.teamContext;

  const { dsyncId } = req.query as { dsyncId: string };

  const { directorySync } = await jackson();

  await directorySync.directories.delete(dsyncId);

  sendAudit({
    action: 'dsync.connection.delete',
    crud: 'd',
    user: user,
    team: { id: teamMember.teamId, name: teamMember.teamName },
  });

  res.status(200).json({ data: {} });
};
