import { createPatch } from 'rfc6902';
import { AuditUserType, type PrismaClient, type Prisma } from '@prisma/client';
import type { AuditContext, AuditEvent, AuditInfo, AuditLogger } from './types';
export * from './types';

type RequestInfo = {
  ip?: string;
  userAgent?: string;
};

export const createAuditLogger = (
  prismaClient: PrismaClient,
  request?: RequestInfo
): AuditLogger => {
  return async (event: AuditEvent) => {
    await prismaClient.$transaction(async (tx) => {
      let productName: string | null = null;
      let versionName: string | null = null;

      if (event.versionId) {
        const version = await tx.oscratProductVersion.findUnique({
          where: { id: event.versionId },
          select: { version: true, product: { select: { name: true } } },
        });
        if (version) {
          versionName = version.version;
          productName = version.product.name;
        }
      } else if (event.productId) {
        const product = await tx.oscratProduct.findUnique({
          where: { id: event.productId },
          select: { name: true },
        });
        productName = product?.name ?? null;
      }

      await tx.auditLog.create({
        data: {
          userId: event.user.id,
          userType: AuditUserType.USER,
          userName: event.user.name,
          action: event.action,
          crud: event.crud,
          targetType: event.target.type,
          targetId: event.target.id,
          targetName: event.target.name,
          teamId: event.team.id,
          productId: event.productId,
          productName,
          versionId: event.versionId,
          versionName,
          metadata: event.metadata,
          ipAddress: request?.ip,
          userAgent: request?.userAgent,
        },
      });
    });
  };
};

export const createAuditContext = (
  prisma: PrismaClient,
  auditInfo: AuditInfo
): AuditContext => ({
  user: auditInfo.user,
  team: auditInfo.team,
  productId: auditInfo.productId,
  versionId: auditInfo.versionId,
  log: createAuditLogger(prisma),
});

export const createAuditLoggerWithTx = (
  tx: PrismaClient | Prisma.TransactionClient,
  request?: RequestInfo
): AuditLogger => {
  return async (event: AuditEvent) => {
    let productName: string | null = null;
    let versionName: string | null = null;

    if (event.versionId) {
      const version = await tx.oscratProductVersion.findUnique({
        where: { id: event.versionId },
        select: { version: true, product: { select: { name: true } } },
      });
      if (version) {
        versionName = version.version;
        productName = version.product.name;
      }
    } else if (event.productId) {
      const product = await tx.oscratProduct.findUnique({
        where: { id: event.productId },
        select: { name: true },
      });
      productName = product?.name ?? null;
    }

    await tx.auditLog.create({
      data: {
        userId: event.user.id,
        userType: AuditUserType.USER,
        userName: event.user.name,
        action: event.action,
        crud: event.crud,
        targetType: event.target.type,
        targetId: event.target.id,
        targetName: event.target.name,
        teamId: event.team.id,
        productId: event.productId,
        productName,
        versionId: event.versionId,
        versionName,
        metadata: event.metadata,
        ipAddress: request?.ip,
        userAgent: request?.userAgent,
      },
    });
  };
};

export const createAuditContextWithTx = (
  tx: Prisma.TransactionClient,
  auditInfo: AuditInfo,
  request?: RequestInfo
): AuditContext => ({
  user: auditInfo.user,
  team: auditInfo.team,
  productId: auditInfo.productId,
  versionId: auditInfo.versionId,
  log: createAuditLoggerWithTx(tx, request),
});

export const CrudType = {
  Create: 'c',
  Read: 'r',
  Update: 'u',
  Delete: 'd',
} as const;

export type CrudType = (typeof CrudType)[keyof typeof CrudType];

export const EntityType = {
  Vulnerability: 'Vulnerability',
  Incident: 'Incident',
  Repository: 'Repository',
  Task: 'Task',
  Product: 'Product',
  ProductVersion: 'ProductVersion',
  SbomReport: 'SbomReport',
  VulnerabilityScanReport: 'VulnerabilityScanReport',
  ConfigurationScanReport: 'ConfigurationScanReport',
  File: 'File',
  Team: 'Team',
  TeamMember: 'TeamMember',
  Invitation: 'Invitation',
  SsoConnection: 'SsoConnection',
  DirectorySync: 'DirectorySync',
  Webhook: 'Webhook',
  ApiKey: 'ApiKey',
  Assessment: 'Assessment',
  Attachment: 'Attachment',
  Documentation: 'Documentation',
} as const;

export type EntityType = (typeof EntityType)[keyof typeof EntityType];

const TRACKED_FIELDS: Record<EntityType, string[]> = {
  Vulnerability: ['name', 'severity', 'status', 'cve', 'description', 'advisoryId', 'dateOfDiscovery', 'affectedMemberStates'],
  Incident: ['status', 'severity', 'classification', 'description', 'attackType', 'scope', 'dateOfDetection'],
  Repository: ['name', 'repositoryUrl', 'targetBranch', 'provider'],
  Task: ['title', 'status', 'duedate', 'assigneeId', 'description'],
  Product: ['name', 'acronym', 'type', 'productCategory', 'description', 'status'],
  ProductVersion: ['version', 'status', 'supportEndDate'],
  SbomReport: ['name', 'format', 'status'],
  VulnerabilityScanReport: ['name', 'status', 'sbomReportId'],
  ConfigurationScanReport: ['name', 'status'],
  File: ['name', 'mimeType', 'description'],
  Team: ['name', 'slug', 'domain'],
  TeamMember: ['role', 'userId'],
  Invitation: ['email', 'role'],
  SsoConnection: ['name', 'issuer', 'isActive'],
  DirectorySync: ['name', 'type', 'isActive'],
  Webhook: ['name', 'url', 'events', 'isActive'],
  ApiKey: ['name', 'expiresAt'],
  Assessment: ['type', 'schemaVersion'],
  Attachment: ['name', 'mimeType', 'description', 'taskId', 'versionId', 'vulnerabilityId', 'incidentId'],
  Documentation: ['title', 'level', 'visibility', 'status', 'version', 'productId', 'versionId'],
};

function pick<T extends Record<string, unknown>>(obj: T, fields: string[]): Partial<T> {
  const result: Partial<T> = {};
  for (const f of fields) if (f in obj) result[f as keyof T] = obj[f as keyof T];
  return result;
}

export async function logCreate(
  type: EntityType,
  ctx: AuditContext,
  entity: { id: string; name?: string } & Record<string, unknown>
): Promise<void> {
  const tracked = pick(entity, TRACKED_FIELDS[type]);
  await ctx.log({
    action: `${type.toLowerCase()}.create`,
    crud: CrudType.Create,
    user: ctx.user,
    team: ctx.team,
    target: { id: entity.id, name: entity.name || entity.id, type },
    productId: ctx.productId,
    versionId: ctx.versionId,
    metadata: { snapshot: JSON.stringify(tracked) },
  });
}

export async function logUpdate(
  type: EntityType,
  ctx: AuditContext,
  previous: { id: string; name?: string } & Record<string, unknown>,
  current: { id: string; name?: string } & Record<string, unknown>
): Promise<void> {
  const fields = TRACKED_FIELDS[type];
  const patch = createPatch(pick(previous, fields), pick(current, fields));
  if (patch.length === 0) return;

  await ctx.log({
    action: `${type.toLowerCase()}.update`,
    crud: CrudType.Update,
    user: ctx.user,
    team: ctx.team,
    target: { id: current.id, name: current.name || current.id, type },
    productId: ctx.productId,
    versionId: ctx.versionId,
    metadata: { patch: JSON.stringify(patch) },
  });
}

export async function logDelete(
  type: EntityType,
  ctx: AuditContext,
  entity: { id: string; name?: string }
): Promise<void> {
  await ctx.log({
    action: `${type.toLowerCase()}.delete`,
    crud: CrudType.Delete,
    user: ctx.user,
    team: ctx.team,
    target: { id: entity.id, name: entity.name || entity.id, type },
    productId: ctx.productId,
    versionId: ctx.versionId,
    metadata: {},
  });
}
