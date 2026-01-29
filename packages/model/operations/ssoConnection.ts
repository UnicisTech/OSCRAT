import type { Prisma } from '@prisma/client';
import { createAuditContextWithTx, logCreate, logUpdate, logDelete, EntityType, type AuditInfo } from '../audit';

export interface SsoConnectionAuditData {
  id: string;
  name?: string;
  issuer?: string;
  isActive?: boolean;
}

export const logSsoConnectionCreated = async (
  tx: Prisma.TransactionClient,
  connection: SsoConnectionAuditData,
  auditInfo: AuditInfo
): Promise<void> => {
  const audit = createAuditContextWithTx(tx, auditInfo);
  await logCreate(EntityType.SsoConnection, audit, {
    id: connection.id,
    name: connection.name || 'SSO Connection',
    issuer: connection.issuer || '',
    isActive: connection.isActive ?? true,
  });
};

export const logSsoConnectionUpdated = async (
  tx: Prisma.TransactionClient,
  previous: SsoConnectionAuditData,
  current: SsoConnectionAuditData,
  auditInfo: AuditInfo
): Promise<void> => {
  const audit = createAuditContextWithTx(tx, auditInfo);
  await logUpdate(EntityType.SsoConnection, audit,
    {
      id: previous.id,
      name: previous.name || 'SSO Connection',
      issuer: previous.issuer || '',
      isActive: previous.isActive ?? true,
    },
    {
      id: current.id,
      name: current.name || 'SSO Connection',
      issuer: current.issuer || '',
      isActive: current.isActive ?? true,
    }
  );
};

export const logSsoConnectionDeleted = async (
  tx: Prisma.TransactionClient,
  connection: SsoConnectionAuditData,
  auditInfo: AuditInfo
): Promise<void> => {
  const audit = createAuditContextWithTx(tx, auditInfo);
  await logDelete(EntityType.SsoConnection, audit, {
    id: connection.id,
    name: connection.name || 'SSO Connection',
  });
};
