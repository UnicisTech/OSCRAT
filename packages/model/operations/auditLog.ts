import type { PrismaClient } from '@prisma/client';
import type {
  OscratAuditLogQueryParams,
  OscratPaginatedAuditLogs,
  OscratAuditLogCreate,
  OscratAuditLog,
  AuditLogFilterOptions,
} from '../types/auditLog';

const DEFAULT_PAGE_SIZE = 25;
const MAX_PAGE_SIZE = 100;

export async function getAuditLogs(
  prisma: PrismaClient,
  teamId: string,
  options?: OscratAuditLogQueryParams
): Promise<OscratPaginatedAuditLogs> {
  const page = options?.page || 1;
  const pageSize = Math.min(options?.pageSize || DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE);
  const skip = (page - 1) * pageSize;

  // Build date filter
  const dateFilter: { gte?: Date; lte?: Date } = {};
  if (options?.startDate) {
    dateFilter.gte = new Date(options.startDate);
  }
  if (options?.endDate) {
    const endDate = new Date(options.endDate);
    endDate.setHours(23, 59, 59, 999); // End of day
    dateFilter.lte = endDate;
  }

  const where = {
    teamId,
    ...(options?.action && { action: options.action }),
    ...(options?.targetType && { targetType: options.targetType }),
    ...(options?.targetId && { targetId: options.targetId }),
    ...(options?.userId && { userId: options.userId }),
    ...(options?.productId && { productId: options.productId }),
    ...(options?.versionId && { versionId: options.versionId }),
    ...(options?.crud && { crud: options.crud }),
    ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter }),
    ...(options?.hasProductOrVersion && {
      OR: [
        { productId: { not: null } },
        { versionId: { not: null } },
      ],
    }),
  };

  const [data, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize,
    }),
    prisma.auditLog.count({ where }),
  ]);

  return {
    data,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function createAuditLog(
  prisma: PrismaClient,
  data: OscratAuditLogCreate
): Promise<OscratAuditLog> {
  return prisma.auditLog.create({
    data: {
      userId: data.userId,
      userType: data.userType || 'USER',
      userName: data.userName,
      userEmail: data.userEmail,
      action: data.action,
      crud: data.crud,
      targetType: data.targetType,
      targetId: data.targetId,
      targetName: data.targetName,
      teamId: data.teamId,
      ...(data.metadata != null && { metadata: data.metadata }),
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
    },
  });
}

export async function getAuditLogFilterOptions(
  prisma: PrismaClient,
  teamId: string
): Promise<AuditLogFilterOptions> {
  const [users, targetTypesResult] = await Promise.all([
    prisma.auditLog.findMany({
      where: { teamId },
      select: { userId: true, userName: true, userEmail: true },
      distinct: ['userId'],
      orderBy: { userName: 'asc' },
    }),
    prisma.auditLog.findMany({
      where: { teamId },
      select: { targetType: true },
      distinct: ['targetType'],
      orderBy: { targetType: 'asc' },
    }),
  ]);

  return {
    users,
    targetTypes: targetTypesResult.map((r) => r.targetType),
  };
}
