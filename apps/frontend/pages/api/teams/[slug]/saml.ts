import env from '@/lib/env';
import { ApiError } from '@/lib/errors';
import { prisma } from '@/lib/prisma';
import jackson from '@/lib/jackson';
import { withTeamAuth, type AuthenticatedTeamRequest } from '@/lib/middleware';
import {
  logSsoConnectionCreated,
  logSsoConnectionUpdated,
  logSsoConnectionDeleted,
  type SsoConnectionAuditData,
} from '@oscrat/model/operations';
import type { NextApiResponse } from 'next';
import type { SAMLSSORecord } from '@boxyhq/saml-jackson';

const getConnectionAuditData = (connection: SAMLSSORecord): SsoConnectionAuditData => ({
  id: connection.clientID,
  name: connection.name,
  issuer: connection.idpMetadata?.entityID,
  isActive: !connection.deactivated,
});

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

  await prisma.$transaction(async (tx) => {
    await logSsoConnectionCreated(
      tx,
      getConnectionAuditData(connection),
      {
        user,
        team: { id: teamMember.teamId, name: teamMember.teamName },
      }
    );
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

  const existingConnections = await apiController.getConnections({
    tenant: teamMember.teamId,
    product: env.product,
  }) as SAMLSSORecord[];
  const existing = existingConnections.find(c => c.clientID === clientID);

  await apiController.updateSAMLConnection({
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

  const updatedConnections = await apiController.getConnections({
    tenant: teamMember.teamId,
    product: env.product,
  }) as SAMLSSORecord[];
  const updated = updatedConnections.find(c => c.clientID === clientID);

  if (existing && updated) {
    await prisma.$transaction(async (tx) => {
      await logSsoConnectionUpdated(
        tx,
        getConnectionAuditData(existing),
        getConnectionAuditData(updated),
        {
          user,
          team: { id: teamMember.teamId, name: teamMember.teamName },
        }
      );
    });
  }

  res.status(200).json({ data: updated });
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

  const existingConnections = await apiController.getConnections({
    tenant: teamMember.teamId,
    product: env.product,
  }) as SAMLSSORecord[];
  const existing = existingConnections.find(c => c.clientID === clientID);

  await apiController.deleteConnections({ clientID, clientSecret });

  if (existing) {
    await prisma.$transaction(async (tx) => {
      await logSsoConnectionDeleted(
        tx,
        getConnectionAuditData(existing),
        {
          user,
          team: { id: teamMember.teamId, name: teamMember.teamName },
        }
      );
    });
  }

  res.json({ data: {} });
};
