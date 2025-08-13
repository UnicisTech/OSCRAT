import { prisma } from '@/lib/prisma';
import * as AttachmentOps from '@oscrat/model/operations/attachment';
import { parseFormData, validateFile, extractFileData } from '@/lib/utils/fileUpload';
import formidable from 'formidable';
import { v4 as uuidv4 } from 'uuid';
import type { Attachment } from '@oscrat/model';

export interface CreateVersionAttachmentParams {
  versionId: string;
  filename: string;
  fileData: Buffer;
  createdBy: string;
  description?: string;
}

export const createVersionAttachment = async (params: CreateVersionAttachmentParams) => {
  return await AttachmentOps.createAttachment(prisma, {
    name: params.filename,
    description: params.description,
    fileData: params.fileData,
    fileSize: params.fileData.length,
    versionId: params.versionId,
    createdBy: params.createdBy,
  });
};

export const getVersionAttachments = async (versionId: string): Promise<Attachment[]> => {
  return await AttachmentOps.getVersionAttachments(prisma, versionId);
};

export const getVersionAttachmentById = async (attachmentId: string): Promise<Attachment | null> => {
  return await AttachmentOps.getAttachmentById(prisma, attachmentId);
};

export const getVersionAttachmentWithData = async (attachmentId: string) => {
  return await AttachmentOps.getAttachmentWithFileById(prisma, attachmentId);
};

export const deleteVersionAttachment = async (attachmentId: string): Promise<void> => {
  return await AttachmentOps.deleteAttachment(prisma, attachmentId);
};

// Use shared file handling utilities
export const readFile = parseFormData;

export interface UploadVersionAttachmentParams {
  versionId: string;
  file: formidable.File;
  createdBy: string;
  description?: string;
}

export const saveFileAsVersionAttachment = async (params: UploadVersionAttachmentParams): Promise<string> => {
  const fileUpload = await extractFileData(params.file);
  const attachmentId = uuidv4();

  await createVersionAttachment({
    versionId: params.versionId,
    filename: fileUpload.filename,
    fileData: fileUpload.fileData,
    createdBy: params.createdBy,
    description: params.description,
  });

  return `/version-attachments/${attachmentId}`;
};

// Use shared file validation
export const checkExtensionAndMIMEType = validateFile;