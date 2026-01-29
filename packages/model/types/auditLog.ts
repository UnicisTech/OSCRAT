import type { AuditUserType, Prisma } from '@prisma/client';
import type { JsonValue } from '@prisma/client/runtime/library';

// Custom interface following project pattern (like OscratIncidentSummary, OscratVulnerabilitySummary)
export interface OscratAuditLog {
  id: string;
  userId: string;
  userType: AuditUserType;
  userName: string | null;
  userEmail: string | null;
  action: string;
  crud: string;
  targetType: string;
  targetId: string | null;
  targetName: string | null;
  teamId: string;
  productId: string | null;
  productName: string | null;
  versionId: string | null;
  versionName: string | null;
  metadata: JsonValue | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date;
}

export interface OscratAuditLogQueryParams {
  page?: number;
  pageSize?: number;
  action?: string;
  targetType?: string;
  targetId?: string;
  userId?: string;
  productId?: string;
  versionId?: string;
  hasProductOrVersion?: boolean; // Filter where productId OR versionId is not null
}

export interface OscratPaginatedAuditLogs {
  data: OscratAuditLog[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface OscratAuditLogCreate {
  userId: string;
  userType?: AuditUserType;
  userName?: string | null;
  userEmail?: string | null;
  action: string;
  crud: string;
  targetType: string;
  targetId?: string | null;
  targetName?: string | null;
  teamId: string;
  metadata?: Prisma.InputJsonValue | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}
