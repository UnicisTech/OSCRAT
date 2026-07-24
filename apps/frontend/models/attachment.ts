import { prisma } from '@/lib/prisma';
import * as AttachmentOps from '@oscrat/model/operations';
import {
  parseFormData,
  validateFile,
  extractFileData,
} from '@/lib/utils/fileUpload';
import formidable from 'formidable';
import { NextApiRequest } from 'next';
import { v4 as uuidv4 } from 'uuid';
import type { AuditInfo } from '@oscrat/model/audit';

export const createAttachment = async (
  taskId: number,
  filename: string,
  fileData: Buffer,
  url: string,
  attachmentId: string,
  createdBy: string,
  description?: string,
  auditInfo?: AuditInfo,
  versionId?: string
) => {
  return await AttachmentOps.createAttachment(
    prisma,
    {
      name: filename,
      description,
      url,
      fileData,
      fileSize: fileData.length,
      taskId,
      createdBy,
      versionId,
    },
    auditInfo
  );
};

export const deleteAttachment = async (
  id: string,
  teamId: string,
  auditInfo?: AuditInfo
) => {
  return await AttachmentOps.deleteAttachment(prisma, id, teamId, auditInfo);
};

// Use shared file handling utilities
export const readFile = parseFormData;

export interface UploadAttachmentParams {
  taskNumber: number;
  slug: string;
  file: formidable.File;
  createdBy: string;
  description?: string;
  auditInfo?: AuditInfo;
}

export const saveFileAsAttachment = async (params: UploadAttachmentParams) => {
  const task = await AttachmentOps.getTaskRefBySlugAndNumber(
    prisma,
    params.taskNumber,
    params.slug
  );
  if (!task) {
    throw new Error('Task not found');
  }

  const fileUpload = await extractFileData(params.file);
  const attachmentId = uuidv4();
  const url = `/attachments/${attachmentId}`;

  await createAttachment(
    task.id,
    fileUpload.filename,
    fileUpload.fileData,
    url,
    attachmentId,
    params.createdBy,
    params.description,
    params.auditInfo,
    task.versionId || undefined
  );

  return url;
};

// Use shared file validation
export const checkExtensionAndMIMEType = validateFile;
