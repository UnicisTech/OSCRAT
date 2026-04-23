import {
  PrismaClient,
  type Prisma,
  OscratProductVersionStatus,
  TaskStatus,
} from '@prisma/client';
import type {
  OscratProductVersionCreate,
  OscratProductVersionUpdate,
  OscratProductVersionSummary,
  OscratProductVersionDetail,
} from '../types/version';
import { OPEN_VULNERABILITY_STATUSES } from '../constants/vulnerability';
import { OPEN_INCIDENT_STATUSES } from '../types/incidents';

const OPEN_TASK_STATUSES: TaskStatus[] = [TaskStatus.TODO, TaskStatus.PLANNED, TaskStatus.IN_PROGRESS];
import {
  upsertAttachmentFileWithTx,
  deleteAttachmentWithTx,
} from './attachment';
import { createAuditContextWithTx, logCreate, logUpdate, logDelete, EntityType, type AuditInfo } from '../audit';

const VERSION_SUMMARY_INCLUDE = {
  _count: {
    select: {
      incidents: {
        where: {
          status: {
            in: OPEN_INCIDENT_STATUSES,
          },
        },
      },
      vulnerabilities: {
        where: {
          status: {
            in: OPEN_VULNERABILITY_STATUSES,
          },
        },
      },
      tasks: {
        where: {
          status: {
            in: OPEN_TASK_STATUSES,
          },
        },
      },
      sbomReports: true,
    },
  },
  repository: {
    select: {
      id: true,
    },
  },
  conformityAssessmentReport: true,
  declarationOfConformity: true,
};

const VERSION_DETAIL_INCLUDE = {
  incidents: {
    include: {
      reporter: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  },
  vulnerabilities: true,
  assessments: true,
  attachments: true,
  repository: {
    select: {
      id: true,
      name: true,
      provider: true,
      repositoryUrl: true,
      targetBranch: true,
      targetTag: true,
      targetCommit: true,
    },
  },
  conformityAssessmentReport: true,
  declarationOfConformity: true,
  _count: {
    select: {
      sbomReports: true,
      tasks: {
        where: {
          status: {
            in: OPEN_TASK_STATUSES,
          },
        },
      },
    },
  },
};

type VersionSummaryPayload = Prisma.OscratProductVersionGetPayload<{
  include: typeof VERSION_SUMMARY_INCLUDE;
}>;

type VersionDetailPayload = Prisma.OscratProductVersionGetPayload<{
  include: typeof VERSION_DETAIL_INCLUDE;
}>;

export const transformToVersionSummary = (
  version: VersionSummaryPayload
): OscratProductVersionSummary => ({
  id: version.id,
  version: version.version,
  status: version.status,
  releaseDate: version.releaseDate || undefined,
  supportEndDate: version.supportEndDate || undefined,
  productId: version.productId,
  openIncidents: version._count?.incidents || 0,
  openVulnerabilities: version._count?.vulnerabilities || 0,
  openTasks: version._count?.tasks || 0,
  hasRepository: !!version.repository,
  sbomReportsCount: version._count?.sbomReports || 0,
  hasConformityAssessmentReport: !!version.conformityAssessmentReport,
  hasDeclarationOfConformity: !!version.declarationOfConformity,
  createdAt: version.createdAt,
  updatedAt: version.updatedAt,
  createdBy: version.createdBy,
  updatedBy: version.updatedBy,
});

export const transformToVersionDetail = (
  version: VersionDetailPayload
): OscratProductVersionDetail => ({
  id: version.id,
  version: version.version,
  status: version.status,
  releaseDate: version.releaseDate || undefined,
  supportEndDate: version.supportEndDate || undefined,
  productId: version.productId,
  openTasks: version._count?.tasks || 0,
  incidents:
    version.incidents?.map((incident) => ({
      id: incident.id,
      status: incident.status,
      classification: incident.classification,
      attackType: incident.attackType,
      severity: incident.severity,
      dateOfDetection: incident.dateOfDetection,
      description: incident.description,
      scope: incident.scope,
      reporter: {
        id: incident.reporter.id,
        name: incident.reporter.name,
        email: incident.reporter.email,
      },
      createdAt: incident.createdAt,
      updatedAt: incident.updatedAt,
      createdBy: incident.createdBy,
      updatedBy: incident.updatedBy,
    })) || [],
  vulnerabilities:
    version.vulnerabilities?.map((vuln) => ({
      id: vuln.id,
      name: vuln.name,
      description: vuln.description,
      severity: vuln.severity,
      status: vuln.status,
      cve: vuln.cve ?? undefined,
      affectedVendor: vuln.affectedVendor ?? undefined,
      references: vuln.references,
      advisoryId: vuln.advisoryId ?? undefined,
      dateOfDiscovery: vuln.dateOfDiscovery,
      affectedMemberStates: vuln.affectedMemberStates,
      versionId: version.id,
      createdAt: vuln.createdAt,
      updatedAt: vuln.updatedAt,
      createdBy: vuln.createdBy,
      updatedBy: vuln.updatedBy,
    })) || [],
  assessments:
    version.assessments?.map((assessment) => ({
      id: assessment.id,
      type: assessment.type,
      schemaVersion: assessment.schemaVersion,
      teamId: assessment.teamId,
      versionId: assessment.versionId ?? undefined,
      productId: assessment.productId ?? undefined,
      createdAt: assessment.createdAt,
      createdBy: assessment.createdBy,
    })) || [],
  repository: version.repository
    ? {
        id: version.repository.id,
        name: version.repository.name,
        provider: version.repository.provider,
        repositoryUrl: version.repository.repositoryUrl,
        targetBranch: version.repository.targetBranch || undefined,
        targetTag: version.repository.targetTag || undefined,
        targetCommit: version.repository.targetCommit || undefined,
      }
    : undefined,
  sbomReportsCount: version._count?.sbomReports || 0,
  conformityAssessmentReport: version.conformityAssessmentReport ?? undefined,
  declarationOfConformity: version.declarationOfConformity ?? undefined,
  createdAt: version.createdAt,
  updatedAt: version.updatedAt,
  createdBy: version.createdBy,
  updatedBy: version.updatedBy,
});

export const getVersions = async (
  prisma: PrismaClient,
  teamId: string,
  productId: string
): Promise<OscratProductVersionSummary[]> => {
  const versions = await prisma.oscratProductVersion.findMany({
    where: {
      productId: productId,
      teamId: teamId,
    },
    include: VERSION_SUMMARY_INCLUDE,
    orderBy: { createdAt: 'desc' },
  });

  return versions.map(transformToVersionSummary);
};

export const getVersionDetail = async (
  prisma: PrismaClient,
  teamId: string,
  versionId: string
): Promise<OscratProductVersionDetail | null> => {
  const version = await prisma.oscratProductVersion.findFirst({
    where: {
      id: versionId,
      teamId: teamId,
    },
    include: VERSION_DETAIL_INCLUDE,
  });

  return version ? transformToVersionDetail(version) : null;
};

export const createVersion = async (
  prisma: PrismaClient,
  teamId: string,
  data: OscratProductVersionCreate,
  auditInfo: AuditInfo
): Promise<OscratProductVersionDetail> => {
  return await prisma.$transaction(async (tx) => {
    const audit = createAuditContextWithTx(tx, auditInfo);

    const version = await tx.oscratProductVersion.create({
      data: {
        version: data.version,
        status: data.status || OscratProductVersionStatus.DRAFT,
        releaseDate: data.releaseDate,
        supportEndDate: data.supportEndDate,
        productId: data.productId,
        teamId: teamId,
        createdBy: data.createdBy,
        updatedBy: data.createdBy,
      },
      include: VERSION_DETAIL_INCLUDE,
    });

    await logCreate(EntityType.ProductVersion, audit, { ...version, name: version.version });

    return transformToVersionDetail(version);
  });
};

export const updateVersion = async (
  prisma: PrismaClient,
  teamId: string,
  versionId: string,
  data: OscratProductVersionUpdate,
  auditInfo: AuditInfo
): Promise<OscratProductVersionDetail> => {
  return await prisma.$transaction(async (tx) => {
    const audit = createAuditContextWithTx(tx, auditInfo);

    const existing = await tx.oscratProductVersion.findFirst({
      where: { id: versionId, teamId },
    });

    if (!existing) {
      throw new Error('Version not found or does not belong to team');
    }

    const version = await tx.oscratProductVersion.update({
      where: {
        id: versionId,
        teamId: teamId,
      },
      data: {
        version: data.version,
        status: data.status,
        releaseDate: data.releaseDate,
        supportEndDate: data.supportEndDate,
        updatedBy: data.updatedBy,
      },
      include: VERSION_DETAIL_INCLUDE,
    });

    await logUpdate(EntityType.ProductVersion, audit, { ...existing, name: existing.version }, { ...version, name: version.version });

    return transformToVersionDetail(version);
  });
};

export const deleteVersion = async (
  prisma: PrismaClient,
  teamId: string,
  versionId: string,
  auditInfo: AuditInfo
): Promise<void> => {
  await prisma.$transaction(async (tx) => {
    const audit = createAuditContextWithTx(tx, auditInfo);

    const version = await tx.oscratProductVersion.findFirst({
      where: { id: versionId, teamId },
      select: { id: true, version: true },
    });

    if (!version) {
      throw new Error('Version not found or does not belong to team');
    }

    await logDelete(EntityType.ProductVersion, audit, { id: version.id, name: version.version });

    await tx.oscratProductVersion.delete({
      where: {
        id: versionId,
        teamId: teamId,
      },
    });
  });
};

// Shared base interface for CAR and DoC upsert params
export interface UpsertVersionAttachmentParams {
  name: string;
  fileData: Buffer;
  fileSize: number;
  mimeType?: string;
  createdBy: string;
}

// CAR (Conformity Assessment Report) operations

export type UpsertVersionCARParams = UpsertVersionAttachmentParams;

export const upsertVersionCAR = async (
  prisma: PrismaClient,
  teamId: string,
  versionId: string,
  params: UpsertVersionCARParams,
  auditInfo: AuditInfo
): Promise<OscratProductVersionDetail> => {
  return await prisma.$transaction(async (tx) => {
    const audit = createAuditContextWithTx(tx, auditInfo);
    const current = await tx.oscratProductVersion.findFirst({
      where: { id: versionId, teamId },
      select: { conformityAssessmentReportId: true },
    });

    const existingAttachmentId = current?.conformityAssessmentReportId ?? null;
    const isUpdate = existingAttachmentId !== null;

    let existingAttachment: { id: string; name: string; mimeType: string | null } | null = null;
    if (isUpdate && existingAttachmentId) {
      existingAttachment = await tx.attachment.findUnique({
        where: { id: existingAttachmentId },
        select: { id: true, name: true, mimeType: true },
      });
    }

    const attachmentId = await upsertAttachmentFileWithTx(
      tx,
      existingAttachmentId,
      {
        name: params.name,
        fileData: params.fileData,
        fileSize: params.fileSize,
        mimeType: params.mimeType || 'application/octet-stream',
        createdBy: params.createdBy,
        versionId,
      }
    );

    const version = await tx.oscratProductVersion.update({
      where: { id: versionId, teamId },
      data: { conformityAssessmentReportId: attachmentId },
      include: VERSION_DETAIL_INCLUDE,
    });

    const newAttachmentData = {
      id: attachmentId,
      name: params.name,
      mimeType: params.mimeType || 'application/octet-stream',
    };

    if (isUpdate && existingAttachment) {
      await logUpdate(EntityType.File, audit, existingAttachment, newAttachmentData);
    } else {
      await logCreate(EntityType.File, audit, newAttachmentData);
    }

    return transformToVersionDetail(version);
  });
};

export const removeVersionCAR = async (
  prisma: PrismaClient,
  teamId: string,
  versionId: string,
  auditInfo: AuditInfo
): Promise<OscratProductVersionDetail> => {
  return await prisma.$transaction(async (tx) => {
    const audit = createAuditContextWithTx(tx, auditInfo);
    const current = await tx.oscratProductVersion.findFirst({
      where: { id: versionId, teamId },
      select: { conformityAssessmentReportId: true, declarationOfConformityId: true, status: true },
    });

    if (current?.conformityAssessmentReportId) {
      const attachment = await tx.attachment.findUnique({
        where: { id: current.conformityAssessmentReportId },
        select: { id: true, name: true },
      });

      await deleteAttachmentWithTx(tx, current.conformityAssessmentReportId);

      if (attachment) {
        await logDelete(EntityType.File, audit, attachment);
      }
    }

    if (current?.declarationOfConformityId) {
      const docAttachment = await tx.attachment.findUnique({
        where: { id: current.declarationOfConformityId },
        select: { id: true, name: true },
      });

      await deleteAttachmentWithTx(tx, current.declarationOfConformityId);

      if (docAttachment) {
        await logDelete(EntityType.File, audit, docAttachment);
      }
    }

    // Update version: clear both CAR and DoC, reset status if SUPPORTED
    const version = await tx.oscratProductVersion.update({
      where: { id: versionId, teamId },
      data: {
        conformityAssessmentReportId: null,
        declarationOfConformityId: null,
        ...(current?.status === OscratProductVersionStatus.SUPPORTED && {
          status: OscratProductVersionStatus.ACTIVE,
        }),
      },
      include: VERSION_DETAIL_INCLUDE,
    });

    return transformToVersionDetail(version);
  });
};

// DoC (Declaration of Conformity) operations

export interface UpsertVersionDoCParams extends UpsertVersionAttachmentParams {
  updateStatusToSupported?: boolean;
}

export const upsertVersionDoC = async (
  prisma: PrismaClient,
  teamId: string,
  versionId: string,
  params: UpsertVersionDoCParams,
  auditInfo: AuditInfo
): Promise<OscratProductVersionDetail> => {
  return await prisma.$transaction(async (tx) => {
    const audit = createAuditContextWithTx(tx, auditInfo);
    const current = await tx.oscratProductVersion.findFirst({
      where: { id: versionId, teamId },
      select: { declarationOfConformityId: true },
    });

    const existingAttachmentId = current?.declarationOfConformityId ?? null;
    const isUpdate = existingAttachmentId !== null;

    let existingAttachment: { id: string; name: string; mimeType: string | null } | null = null;
    if (isUpdate && existingAttachmentId) {
      existingAttachment = await tx.attachment.findUnique({
        where: { id: existingAttachmentId },
        select: { id: true, name: true, mimeType: true },
      });
    }

    const attachmentId = await upsertAttachmentFileWithTx(
      tx,
      existingAttachmentId,
      {
        name: params.name,
        fileData: params.fileData,
        fileSize: params.fileSize,
        mimeType: params.mimeType || 'application/pdf',
        createdBy: params.createdBy,
        versionId,
      }
    );

    const version = await tx.oscratProductVersion.update({
      where: { id: versionId, teamId },
      data: {
        declarationOfConformityId: attachmentId,
        ...(params.updateStatusToSupported && {
          status: OscratProductVersionStatus.SUPPORTED,
        }),
      },
      include: VERSION_DETAIL_INCLUDE,
    });

    const newAttachmentData = {
      id: attachmentId,
      name: params.name,
      mimeType: params.mimeType || 'application/pdf',
    };

    if (isUpdate && existingAttachment) {
      await logUpdate(EntityType.File, audit, existingAttachment, newAttachmentData);
    } else {
      await logCreate(EntityType.File, audit, newAttachmentData);
    }

    return transformToVersionDetail(version);
  });
};

export const removeVersionDoC = async (
  prisma: PrismaClient,
  teamId: string,
  versionId: string,
  auditInfo: AuditInfo
): Promise<OscratProductVersionDetail> => {
  return await prisma.$transaction(async (tx) => {
    const audit = createAuditContextWithTx(tx, auditInfo);
    const current = await tx.oscratProductVersion.findFirst({
      where: { id: versionId, teamId },
      select: { declarationOfConformityId: true, status: true },
    });

    if (current?.declarationOfConformityId) {
      const attachment = await tx.attachment.findUnique({
        where: { id: current.declarationOfConformityId },
        select: { id: true, name: true },
      });

      await deleteAttachmentWithTx(tx, current.declarationOfConformityId);

      if (attachment) {
        await logDelete(EntityType.File, audit, attachment);
      }
    }

    // Reset status from SUPPORTED to ACTIVE and clear declarationOfConformityId
    const version = await tx.oscratProductVersion.update({
      where: { id: versionId, teamId },
      data: {
        declarationOfConformityId: null,
        ...(current?.status === OscratProductVersionStatus.SUPPORTED && {
          status: OscratProductVersionStatus.ACTIVE,
        }),
      },
      include: VERSION_DETAIL_INCLUDE,
    });

    return transformToVersionDetail(version);
  });
};

export const getVersionCARAttachmentId = async (
  prisma: PrismaClient,
  teamId: string,
  versionId: string
): Promise<string | null> => {
  const version = await prisma.oscratProductVersion.findFirst({
    where: { id: versionId, teamId },
    select: { conformityAssessmentReportId: true },
  });
  return version?.conformityAssessmentReportId ?? null;
};

export const getVersionDoCAttachmentId = async (
  prisma: PrismaClient,
  teamId: string,
  versionId: string
): Promise<string | null> => {
  const version = await prisma.oscratProductVersion.findFirst({
    where: { id: versionId, teamId },
    select: { declarationOfConformityId: true },
  });
  return version?.declarationOfConformityId ?? null;
};
