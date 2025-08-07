import { ApiError } from '@/lib/errors';
import { sendAudit } from '@/lib/retraced';
import {
  createWebhook,
  deleteWebhook,
  findOrCreateApp,
  listWebhooks,
} from '@/lib/svix';
import { withAuth, type AuthenticatedRequest } from '@/lib/middleware';
import type { NextApiResponse } from 'next';
import { EndpointIn } from 'svix';
import { recordMetric } from '@/lib/metrics';
import env from '@/lib/env';

export default function handler(
  req: AuthenticatedRequest,
  res: NextApiResponse
) {
  const { method } = req;

  if (!env.teamFeatures.webhook) {
    throw new ApiError(404, 'Not Found');
  }

  switch (method) {
    case 'POST':
      return withAuth(['team_webhook', 'create'])(handlePOST)(req, res);
    case 'GET':
      return withAuth(['team_webhook', 'read'])(handleGET)(req, res);
    case 'DELETE':
      return withAuth(['team_webhook', 'delete'])(handleDELETE)(req, res);
    default:
      res.setHeader('Allow', 'POST, GET, DELETE');
      throw new ApiError(405, `Method ${method} Not Allowed`);
  }
}

// Create a Webhook endpoint
const handlePOST = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  const { teamMember, user } = req.teamContext;

  const { name, url, eventTypes } = req.body;

  const app = await findOrCreateApp(teamMember.team.name, teamMember.team.id);

  // TODO: The endpoint URL must be HTTPS.

  const data: EndpointIn = {
    description: name,
    url,
    version: 1,
  };

  if (eventTypes.length) {
    data['filterTypes'] = eventTypes;
  }

  if (!app) {
    throw new ApiError(400, 'Bad request.');
  }

  const endpoint = await createWebhook(app.id, data);

  sendAudit({
    action: 'webhook.create',
    crud: 'c',
    user,
    team: teamMember.team,
  });

  recordMetric('webhook.created');

  console.log(`[Webhook] created, endpointId: ${endpoint?.id}, url: ${url}, teamId: ${teamMember.team.id}, createdBy: ${user.id}`);

  res.status(200).json({ data: endpoint });
};

// Get all webhooks created by a team
const handleGET = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  const { teamMember } = req.teamContext;

  const app = await findOrCreateApp(teamMember.team.name, teamMember.team.id);

  if (!app) {
    throw new ApiError(400, 'Bad request. Please add a Svix API key.');
  }

  const webhooks = await listWebhooks(app.id);

  recordMetric('webhook.fetched');

  res.status(200).json({ data: webhooks?.data || [] });
};

// Delete a webhook
const handleDELETE = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  const { teamMember, user } = req.teamContext;

  const { webhookId } = req.query as { webhookId: string };

  const app = await findOrCreateApp(teamMember.team.name, teamMember.team.id);

  if (!app) {
    throw new ApiError(400, 'Bad request.');
  }

  if (app.uid != teamMember.team.id) {
    throw new ApiError(400, 'Bad request.');
  }

  await deleteWebhook(app.id, webhookId);

  sendAudit({
    action: 'webhook.delete',
    crud: 'd',
    user,
    team: teamMember.team,
  });

  recordMetric('webhook.removed');

  res.status(200).json({ data: {} });
};
