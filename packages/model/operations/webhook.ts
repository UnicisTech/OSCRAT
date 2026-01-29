import type { Prisma } from '@prisma/client';
import { createAuditContextWithTx, logCreate, logUpdate, logDelete, EntityType, type AuditInfo } from '../audit';

export interface WebhookAuditData {
  id: string;
  name?: string;
  url: string;
  eventTypes?: string[];
}

export const logWebhookCreated = async (
  tx: Prisma.TransactionClient,
  webhook: WebhookAuditData,
  auditInfo: AuditInfo
): Promise<void> => {
  const audit = createAuditContextWithTx(tx, auditInfo);
  await logCreate(EntityType.Webhook, audit, {
    id: webhook.id,
    name: webhook.name || webhook.id,
    url: webhook.url,
    events: webhook.eventTypes?.join(',') || '',
    isActive: true,
  });
};

export const logWebhookUpdated = async (
  tx: Prisma.TransactionClient,
  previous: WebhookAuditData,
  current: WebhookAuditData,
  auditInfo: AuditInfo
): Promise<void> => {
  const audit = createAuditContextWithTx(tx, auditInfo);
  await logUpdate(EntityType.Webhook, audit,
    {
      id: previous.id,
      name: previous.name || previous.id,
      url: previous.url,
      events: previous.eventTypes?.join(',') || '',
      isActive: true,
    },
    {
      id: current.id,
      name: current.name || current.id,
      url: current.url,
      events: current.eventTypes?.join(',') || '',
      isActive: true,
    }
  );
};

export const logWebhookDeleted = async (
  tx: Prisma.TransactionClient,
  webhook: WebhookAuditData,
  auditInfo: AuditInfo
): Promise<void> => {
  const audit = createAuditContextWithTx(tx, auditInfo);
  await logDelete(EntityType.Webhook, audit, {
    id: webhook.id,
    name: webhook.name || webhook.id,
  });
};
