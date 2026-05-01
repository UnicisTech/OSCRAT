import { PrismaClient, Attachment, File, Prisma } from '@prisma/client';
import { createFileInTransaction } from './file';
import { AttachmentEntityFilters } from '../types/attachments';
import { createAuditContextWithTx, logCreate, logDelete, EntityType } from '../audit';
import type { AuditInfo } from '../audit';

// Attachment with file data for downloads
export interface AttachmentWithFile extends Attachment {
  file: File;
}

// Create attachment parameters
export interface CreateAttachmentParams {
  name: string;
  description?: string;
  url?: string;
  fileData: Buffer;
  fileSize: number;
  mimeType?: string;
  createdBy: string;

  taskId?: number;
  versionId?: string;
  sbomReportId?: string;
  vulnerabilityScanReportId?: string;
  configurationScanReportId?: string;
  vulnerabilityId?: string;
  incidentId?: string;
}

/** Create a new attachment within an existing tx */
export const createAttachmentWithTx = async (
  tx: Prisma.TransactionClient,
  params: CreateAttachmentParams
): Promise<AttachmentWithFile> => {
  console.log(`[Attachment Operations] Creating attachment with tx:`, {
    name: params.name,
    fileSize: params.fileSize,
    taskId: params.taskId,
    versionId: params.versionId,
    sbomReportId: params.sbomReportId,
    vulnerabilityScanReportId: params.vulnerabilityScanReportId,
    configurationScanReportId: params.configurationScanReportId,
    vulnerabilityId: params.vulnerabilityId,
    incidentId: params.incidentId,
  });

  const file = await createFileInTransaction(tx, {
    fileData: params.fileData,
    fileSize: params.fileSize,
    mimeType: params.mimeType,
  });

  const attachment = await tx.attachment.create({
    data: {
      name: params.name,
      fileSize: params.fileSize,
      mimeType: params.mimeType || 'application/octet-stream',
      description: params.description,
      url: params.url,
      fileId: file.id,
      taskId: params.taskId,
      versionId: params.versionId,
      sbomReportId: params.sbomReportId,
      vulnerabilityScanReportId: params.vulnerabilityScanReportId,
      configurationScanReportId: params.configurationScanReportId,
      vulnerabilityId: params.vulnerabilityId,
      incidentId: params.incidentId,
      createdBy: params.createdBy,
    },
    include: {
      file: true,
    },
  });

  console.log(`[Attachment Operations] Attachment created with tx:`, {
    id: attachment.id,
    name: attachment.name,
    fileId: attachment.fileId,
  });

  return attachment;
};

/** Create a new attachment for any entity type with tx */
export const createAttachment = async (
  prisma: PrismaClient,
  params: CreateAttachmentParams,
  auditInfo?: AuditInfo
): Promise<AttachmentWithFile> => {
  console.log(`[Attachment Operations] Creating attachment:`, {
    name: params.name,
    fileSize: params.fileSize,
    taskId: params.taskId,
    versionId: params.versionId,
    sbomReportId: params.sbomReportId,
    vulnerabilityScanReportId: params.vulnerabilityScanReportId,
    configurationScanReportId: params.configurationScanReportId,
    vulnerabilityId: params.vulnerabilityId,
    incidentId: params.incidentId,
  });

  const result = await prisma.$transaction(async (tx) => {
    const attachment = await createAttachmentWithTx(tx, params);

    if (auditInfo) {
      const audit = createAuditContextWithTx(tx, auditInfo);
      await logCreate(EntityType.Attachment, audit, {
        id: attachment.id,
        name: attachment.name,
        mimeType: attachment.mimeType,
        description: attachment.description,
        taskId: attachment.taskId,
        versionId: attachment.versionId,
        vulnerabilityId: attachment.vulnerabilityId,
        incidentId: attachment.incidentId,
      });
    }

    return attachment;
  });

  console.log(`[Attachment Operations] Attachment created:`, {
    id: result.id,
    name: result.name,
    fileId: result.fileId,
  });

  return result;
};

export const getAttachmentById = async (
  prisma: PrismaClient,
  attachmentId: string
) => {
  console.log(`[Attachment Operations] Getting attachment: ${attachmentId}`);

  return await prisma.attachment.findUnique({
    where: { id: attachmentId },
  });
};

export const getAttachmentWithFileById = async (
  prisma: PrismaClient,
  attachmentId: string
) => {
  console.log(
    `[Attachment Operations] Getting attachment with file data: ${attachmentId}`
  );

  return await prisma.attachment.findUnique({
    where: { id: attachmentId },
    include: {
      file: true,
    },
  });
};

export const getTaskAttachments = async (
  prisma: PrismaClient,
  taskId: number
) => {
  console.log(
    `[Attachment Operations] Getting attachments for task: ${taskId}`
  );

  const attachments = await prisma.attachment.findMany({
    where: { taskId },
    include: {
      createdByUser: {
        select: { id: true, name: true, firstName: true, lastName: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  console.log(
    `[Attachment Operations] Found ${attachments.length} attachments for task ${taskId}`
  );
  return attachments;
};

export const getVersionAttachments = async (
  prisma: PrismaClient,
  versionId: string,
  filters?: AttachmentEntityFilters
) => {
  console.log(
    `[Attachment Operations] Getting attachments for version: ${versionId}`,
    filters ? `with filters: ${JSON.stringify(filters)}` : ''
  );

  const attachments = await prisma.attachment.findMany({
    where: {
      versionId,
      ...(filters?.vulnerabilityId && { vulnerabilityId: filters.vulnerabilityId }),
      ...(filters?.incidentId && { incidentId: filters.incidentId }),
    },
    include: {
      createdByUser: {
        select: { id: true, name: true, firstName: true, lastName: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  console.log(
    `[Attachment Operations] Found ${attachments.length} attachments for version ${versionId}`
  );
  return attachments;
};

export const getSbomReportAttachment = async (
  prisma: PrismaClient,
  sbomReportId: string
) => {
  console.log(
    `[Attachment Operations] Getting attachment for SBOM report: ${sbomReportId}`
  );

  return await prisma.attachment.findUnique({
    where: { sbomReportId },
  });
};

export const deleteAttachment = async (
  prisma: PrismaClient,
  attachmentId: string,
  auditInfo?: AuditInfo
): Promise<void> => {
  console.log(`[Attachment Operations] Deleting attachment: ${attachmentId}`);

  await prisma.$transaction(async (tx) => {
    const attachment = await tx.attachment.findUnique({
      where: { id: attachmentId },
      select: { id: true, name: true, fileId: true },
    });

    if (!attachment) {
      throw new Error(`Attachment ${attachmentId} not found`);
    }

    if (auditInfo) {
      const audit = createAuditContextWithTx(tx, auditInfo);
      await logDelete(EntityType.Attachment, audit, { id: attachment.id, name: attachment.name });
    }

    await tx.attachment.delete({
      where: { id: attachmentId },
    });

    console.log(
      `[Attachment Operations] Attachment and file deleted: ${attachmentId}`
    );
  });
};

// Upsert attachment file parameters
export interface UpsertAttachmentFileParams {
  name: string;
  fileData: Buffer;
  fileSize: number;
  mimeType?: string;
  createdBy: string;
  versionId?: string;
}

/**
 * Upsert attachment file within a transaction.
 * If existingAttachmentId is provided and valid, updates the file in place using nested update.
 * Otherwise creates a new attachment with nested file creation.
 * Returns the attachment ID.
 */
export const upsertAttachmentFileWithTx = async (
  tx: Prisma.TransactionClient,
  existingAttachmentId: string | null,
  params: UpsertAttachmentFileParams
): Promise<string> => {
  if (existingAttachmentId) {
    const existingAttachment = await tx.attachment.findUnique({
      where: { id: existingAttachmentId },
      select: { id: true, fileId: true },
    });

    if (existingAttachment) {
      // Update attachment metadata
      await tx.attachment.update({
        where: { id: existingAttachmentId },
        data: {
          name: params.name,
          fileSize: params.fileSize,
          mimeType: params.mimeType,
          ...(params.versionId && { versionId: params.versionId }),
        },
      });

      // Update file data separately (required due to explicit fileId foreign key)
      await tx.file.update({
        where: { id: existingAttachment.fileId },
        data: {
          fileData: new Uint8Array(params.fileData),
          fileSize: params.fileSize,
          mimeType: params.mimeType,
        },
      });

      return existingAttachmentId;
    }
  }

  // Create file first, then attachment (required due to explicit fileId foreign key)
  const file = await createFileInTransaction(tx, {
    fileData: params.fileData,
    fileSize: params.fileSize,
    mimeType: params.mimeType,
  });

  const attachment = await tx.attachment.create({
    data: {
      name: params.name,
      fileSize: params.fileSize,
      mimeType: params.mimeType || 'application/octet-stream',
      createdBy: params.createdBy,
      fileId: file.id,
      ...(params.versionId && { versionId: params.versionId }),
    },
  });

  return attachment.id;
};

/**
 * Delete attachment and its file within a transaction.
 */
export const deleteAttachmentWithTx = async (
  tx: Prisma.TransactionClient,
  attachmentId: string
): Promise<void> => {
  const attachment = await tx.attachment.findUnique({
    where: { id: attachmentId },
    select: { fileId: true },
  });

  if (attachment) {
    await tx.attachment.delete({ where: { id: attachmentId } });
    if (attachment.fileId) {
      await tx.file.delete({ where: { id: attachment.fileId } });
    }
  }
};
