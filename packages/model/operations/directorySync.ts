import type { Prisma } from '@prisma/client';
import { createAuditContextWithTx, logCreate, logDelete, EntityType, type AuditInfo } from '../audit';

export interface DirectorySyncAuditData {
  id: string;
  name: string;
  type: string;
  isActive?: boolean;
}

export const logDirectorySyncCreated = async (
  tx: Prisma.TransactionClient,
  directory: DirectorySyncAuditData,
  auditInfo: AuditInfo
): Promise<void> => {
  const audit = createAuditContextWithTx(tx, auditInfo);
  await logCreate(EntityType.DirectorySync, audit, {
    id: directory.id,
    name: directory.name,
    type: directory.type,
    isActive: directory.isActive ?? true,
  });
};

export const logDirectorySyncDeleted = async (
  tx: Prisma.TransactionClient,
  directory: DirectorySyncAuditData,
  auditInfo: AuditInfo
): Promise<void> => {
  const audit = createAuditContextWithTx(tx, auditInfo);
  await logDelete(EntityType.DirectorySync, audit, {
    id: directory.id,
    name: directory.name,
  });
};
