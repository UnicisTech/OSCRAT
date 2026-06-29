import { createPatch, Pointer, type Operation } from 'rfc6902';
import { AuditUserType, type PrismaClient, type Prisma } from '@prisma/client';
import type { AuditContext, AuditEvent, AuditInfo, AuditLogger } from './types';
export * from './types';

/**
 * Audit-log patch op enriched with the previous value at the op's path.
 *
 * RFC 6902 only carries the destination value — but consumers of the audit
 * log (e.g. the AuditDetailsModal) need to display "old → new", so we attach
 * `previousValue` ourselves at write time. The field is intentionally
 * non-standard; it's ignored by any JSON-Patch applier and read only by the
 * UI. Consumers that encounter an older log without `previousValue`
 * gracefully degrade to "→ new".
 */
type EnrichedOperation = Operation & { previousValue?: unknown };

function enrichPatchWithPreviousValues(
  patch: Operation[],
  previous: Record<string, unknown>
): EnrichedOperation[] {
  return patch.map((op) => {
    // `add` operations have no prior value at the destination path.
    if (op.op === 'add') return op;
    try {
      const previousValue = Pointer.fromJSON(op.path).get(previous);
      return { ...op, previousValue };
    } catch {
      // Defensive: malformed path shouldn't break audit-log creation.
      return op;
    }
  });
}

type RequestInfo = {
  ip?: string;
  userAgent?: string;
};

const resolveAuditDenormalizedFields = async (
  tx: PrismaClient | Prisma.TransactionClient,
  event: AuditEvent
): Promise<{
  userName: string | null;
  productName: string | null;
  versionName: string | null;
}> => {
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

  let userName: string | null = event.user.name ?? null;
  if (!userName) {
    const user = await tx.user.findUnique({
      where: { id: event.user.id },
      select: { name: true, email: true },
    });
    userName = user?.name || user?.email || null;
  }

  return { userName, productName, versionName };
};

export const createAuditLogger = (
  prismaClient: PrismaClient,
  request?: RequestInfo
): AuditLogger => {
  return async (event: AuditEvent) => {
    await prismaClient.$transaction(async (tx) => {
      const { userName, productName, versionName } =
        await resolveAuditDenormalizedFields(tx, event);

      await tx.auditLog.create({
        data: {
          userId: event.user.id,
          userType: AuditUserType.USER,
          userName,
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
    const { userName, productName, versionName } =
      await resolveAuditDenormalizedFields(tx, event);

    await tx.auditLog.create({
      data: {
        userId: event.user.id,
        userType: AuditUserType.USER,
        userName,
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
  Incident: ['name', 'status', 'severity', 'classification', 'description', 'attackType', 'scope', 'dateOfDetection'],
  Repository: ['name', 'repositoryUrl', 'targetBranch', 'provider'],
  Task: ['title', 'status', 'duedate', 'assigneeId', 'description'],
  Product: ['name', 'acronym', 'type', 'productCategory', 'description', 'status'],
  ProductVersion: ['version', 'status', 'releaseDate', 'supportEndDate'],
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
  Attachment: ['name', 'mimeType', 'description', 'taskId', 'versionId', 'vulnerabilityId', 'incidentId', 'assessmentId'],
  Documentation: ['title', 'level', 'visibility', 'status', 'version', 'productId', 'versionId'],
};

function pick<T extends Record<string, unknown>>(obj: T, fields: string[]): Partial<T> {
  const result: Partial<T> = {};
  for (const f of fields) if (f in obj) result[f as keyof T] = obj[f as keyof T];
  return result;
}

function resolveEntityScope(
  ctx: AuditContext,
  entity: Record<string, unknown>
): { productId?: string; versionId?: string } {
  const versionId = 'versionId' in entity
    ? (entity.versionId as string) || undefined
    : ctx.versionId;
  const productId = 'productId' in entity
    ? (entity.productId as string) || undefined
    : ctx.productId;
  return { productId, versionId };
}

// Accept `name: string | null | undefined` for entities whose Prisma column is
// nullable (e.g. Incident). `entity.name || entity.id` already coalesces to a
// safe display string downstream.
type AuditEntity = { id: string; name?: string | null } & Record<
  string,
  unknown
>;

export async function logCreate(
  type: EntityType,
  ctx: AuditContext,
  entity: AuditEntity
): Promise<void> {
  const tracked = pick(entity, TRACKED_FIELDS[type]);
  const scope = resolveEntityScope(ctx, entity);
  await ctx.log({
    action: `${type.toLowerCase()}.create`,
    crud: CrudType.Create,
    user: ctx.user,
    team: ctx.team,
    target: { id: entity.id, name: entity.name || entity.id, type },
    productId: scope.productId,
    versionId: scope.versionId,
    metadata: { snapshot: JSON.stringify(tracked) },
  });
}

export async function logUpdate(
  type: EntityType,
  ctx: AuditContext,
  previous: AuditEntity,
  current: AuditEntity
): Promise<void> {
  const fields = TRACKED_FIELDS[type];
  const previousSubset = pick(previous, fields);
  const patch = createPatch(previousSubset, pick(current, fields));
  if (patch.length === 0) return;

  const enrichedPatch = enrichPatchWithPreviousValues(patch, previousSubset);

  const scope = resolveEntityScope(ctx, current);
  await ctx.log({
    action: `${type.toLowerCase()}.update`,
    crud: CrudType.Update,
    user: ctx.user,
    team: ctx.team,
    target: { id: current.id, name: current.name || current.id, type },
    productId: scope.productId,
    versionId: scope.versionId,
    metadata: { patch: JSON.stringify(enrichedPatch) },
  });
}

export async function logDelete(
  type: EntityType,
  ctx: AuditContext,
  entity: AuditEntity
): Promise<void> {
  const scope = resolveEntityScope(ctx, entity);
  await ctx.log({
    action: `${type.toLowerCase()}.delete`,
    crud: CrudType.Delete,
    user: ctx.user,
    team: ctx.team,
    target: { id: entity.id, name: entity.name || entity.id, type },
    productId: scope.productId,
    versionId: scope.versionId,
    metadata: {},
  });
}
