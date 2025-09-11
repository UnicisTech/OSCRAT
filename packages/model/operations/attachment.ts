import { PrismaClient, Attachment, File, Prisma } from '@prisma/client';
import { createFileInTransaction } from './file';

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
  params: CreateAttachmentParams
): Promise<AttachmentWithFile> => {
  console.log(`[Attachment Operations] Creating attachment:`, {
    name: params.name,
    fileSize: params.fileSize,
    taskId: params.taskId,
    versionId: params.versionId,
    sbomReportId: params.sbomReportId,
  });

  const result = await prisma.$transaction(async (tx) => {
    return await createAttachmentWithTx(tx, params);
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
  versionId: string
) => {
  console.log(
    `[Attachment Operations] Getting attachments for version: ${versionId}`
  );

  const attachments = await prisma.attachment.findMany({
    where: { versionId },
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
  attachmentId: string
): Promise<void> => {
  console.log(`[Attachment Operations] Deleting attachment: ${attachmentId}`);

  await prisma.$transaction(async (tx) => {
    const attachment = await tx.attachment.findUnique({
      where: { id: attachmentId },
      select: { fileId: true },
    });

    if (!attachment) {
      throw new Error(`Attachment ${attachmentId} not found`);
    }

    await tx.attachment.delete({
      where: { id: attachmentId },
    });

    console.log(
      `[Attachment Operations] Attachment and file deleted: ${attachmentId}`
    );
  });
};
