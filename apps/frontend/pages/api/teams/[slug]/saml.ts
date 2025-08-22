import env from '@/lib/env';
import { ApiError } from '@/lib/errors';
import jackson from '@/lib/jackson';
import { withTeamAuth, type AuthenticatedTeamRequest } from '@/lib/middleware';
import { sendAudit } from '@/lib/retraced';
import type { NextApiResponse } from 'next';

export default function handler(
  req: AuthenticatedTeamRequest,
  res: NextApiResponse
) {
  const { method } = req;

  if (!env.teamFeatures.sso) {
    throw new ApiError(404, 'Not Found');
  }

  switch (method) {
    case 'GET':
      return withTeamAuth(['team_sso', 'read'])(handleGET)(req, res);
    case 'POST':
      return withTeamAuth(['team_sso', 'create'])(handlePOST)(req, res);
    case 'PATCH':
      return withTeamAuth(['team_sso', 'create'])(handlePATCH)(req, res);
    case 'DELETE':
      return withTeamAuth(['team_sso', 'delete'])(handleDELETE)(req, res);
    default:
      res.setHeader('Allow', 'GET, POST, PATCH, DELETE');
      res.status(405).json({
        error: { message: `Method ${method} Not Allowed` },
      });
  }
}

// Get the SAML connection for the team.
const handleGET = async (
  req: AuthenticatedTeamRequest,
  res: NextApiResponse
) => {
  const { teamMember } = req.teamContext;

  const { apiController } = await jackson();

  const connections = await apiController.getConnections({
    tenant: teamMember.teamId,
    product: env.product,
  });

  res.json({ data: connections });
};

// Create a SAML connection for the team.
const handlePOST = async (
  req: AuthenticatedTeamRequest,
  res: NextApiResponse
) => {
  const { teamMember, user } = req.teamContext;

  const { metadataUrl, encodedRawMetadata } = req.body;

  const { apiController } = await jackson();

  const connection = await apiController.createSAMLConnection({
    encodedRawMetadata,
    metadataUrl,
    defaultRedirectUrl: env.saml.callback,
    redirectUrl: env.saml.callback,
    tenant: teamMember.teamId,
    product: env.product,
  });

  sendAudit({
    action: 'sso.connection.create',
    crud: 'c',
    user: user,
    team: teamMember.team,
  });

  res.status(201).json({ data: connection });
};

const handlePATCH = async (
  req: AuthenticatedTeamRequest,
  res: NextApiResponse
) => {
  const { teamMember, user } = req.teamContext;

  const {
    metadataUrl,
    encodedRawMetadata,
    clientID,
    clientSecret,
    deactivated,
  } = req.body;

  const { apiController } = await jackson();

  const connection = await apiController.updateSAMLConnection({
    clientID,
    clientSecret,
    encodedRawMetadata,
    metadataUrl,
    deactivated,
    defaultRedirectUrl: env.saml.callback,
    redirectUrl: env.saml.callback,
    tenant: teamMember.teamId,
    product: env.product,
  });

  sendAudit({
    action: 'sso.connection.patch',
    crud: 'u',
    user: user,
    team: teamMember.team,
  });

  res.status(200).json({ data: connection });
};

const handleDELETE = async (
  req: AuthenticatedTeamRequest,
  res: NextApiResponse
) => {
  const { teamMember, user } = req.teamContext;

  const { clientID, clientSecret } = req.query as {
    clientID: string;
    clientSecret: string;
  };

  const { apiController } = await jackson();

  await apiController.deleteConnections({ clientID, clientSecret });

  sendAudit({
    action: 'sso.connection.delete',
    crud: 'c',
    user: user,
    team: teamMember.team,
  });

  res.json({ data: {} });
};
