import { ApiError } from '@/lib/errors';
import { prisma } from '@/lib/prisma';
import { withTeamAuth, type AuthenticatedTeamRequest } from '@/lib/middleware';
import { findOrCreateApp, findWebhook, updateWebhook } from '@/lib/svix';
import { logWebhookUpdated } from '@oscrat/model/operations';
import type { NextApiResponse } from 'next';
import type { EndpointIn } from 'svix';
import { recordMetric } from '@/lib/metrics';
import env from '@/lib/env';

export default function handler(
  req: AuthenticatedTeamRequest,
  res: NextApiResponse
) {
  const { method } = req;

  if (!env.teamFeatures.webhook) {
    throw new ApiError(404, 'Not Found');
  }

  switch (method) {
    case 'GET':
      return withTeamAuth(['team_webhook', 'read'])(handleGET)(req, res);
    case 'PUT':
      return withTeamAuth(['team_webhook', 'update'])(handlePUT)(req, res);
    default:
      res.setHeader('Allow', 'GET, PUT');
      res.status(405).json({
        error: { message: `Method ${method} Not Allowed` },
      });
  }
}

// Get a Webhook
const handleGET = async (
  req: AuthenticatedTeamRequest,
  res: NextApiResponse
) => {
  const { teamMember } = req.teamContext;

  const { endpointId } = req.query as {
    endpointId: string;
  };

  const app = await findOrCreateApp(teamMember.teamName, teamMember.teamId);

  if (!app) {
    throw new ApiError(200, 'Bad request.');
  }

  const webhook = await findWebhook(app.id, endpointId as string);

  recordMetric('webhook.fetched');

  res.status(200).json({ data: webhook });
};

// Update a Webhook
const handlePUT = async (
  req: AuthenticatedTeamRequest,
  res: NextApiResponse
) => {
  const { teamMember, user } = req.teamContext;

  const { endpointId } = req.query as {
    endpointId: string;
  };

  const { name, url, eventTypes } = req.body;

  const app = await findOrCreateApp(teamMember.teamName, teamMember.teamId);

  if (!app) {
    throw new ApiError(200, 'Bad request.');
  }

  const existing = await findWebhook(app.id, endpointId);

  const data: EndpointIn = {
    description: name,
    url,
    version: 1,
  };

  if (eventTypes.length > 0) {
    data['filterTypes'] = eventTypes;
  }

  const webhook = await updateWebhook(app.id, endpointId, data);

  if (webhook && existing) {
    await prisma.$transaction(async (tx) => {
      await logWebhookUpdated(
        tx,
        {
          id: existing.id,
          name: existing.description,
          url: existing.url,
          eventTypes: existing.filterTypes,
        },
        {
          id: webhook.id,
          name,
          url,
          eventTypes,
        },
        {
          user,
          team: { id: teamMember.teamId, name: teamMember.teamName },
        }
      );
    });
  }

  recordMetric('webhook.updated');

  res.status(200).json({ data: webhook });
};
