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

export const findAttachmentById = async (id: string) => {
  return await AttachmentOps.getAttachmentById(prisma, id);
};

export const deleteAttachment = async (id: string, auditInfo?: AuditInfo) => {
  return await AttachmentOps.deleteAttachment(prisma, id, auditInfo);
};

// Use shared file handling utilities
export const readFile = parseFormData;

export interface UploadAttachmentParams {
  taskId: number;
  file: formidable.File;
  createdBy: string;
  description?: string;
  auditInfo?: AuditInfo;
  versionId?: string;
}

export const saveFileAsAttachment = async (params: UploadAttachmentParams) => {
  const fileUpload = await extractFileData(params.file);
  const attachmentId = uuidv4();
  const url = `/attachments/${attachmentId}`;

  await createAttachment(
    params.taskId,
    fileUpload.filename,
    fileUpload.fileData,
    url,
    attachmentId,
    params.createdBy,
    params.description,
    params.auditInfo,
    params.versionId
  );

  return url;
};

// Use shared file validation
export const checkExtensionAndMIMEType = validateFile;
