import { prisma } from '@/lib/prisma';
import * as AttachmentOps from '@oscrat/model/operations/attachment';
import {
  parseFormData,
  validateFile,
  extractFileData,
} from '@/lib/utils/fileUpload';
import formidable from 'formidable';
import type { Attachment } from '@oscrat/model';
import type { AuditInfo } from '@oscrat/model/audit';

export interface CreateAssessmentAttachmentParams {
  assessmentId: string;
  filename: string;
  fileData: Buffer;
  createdBy: string;
  description?: string;
  auditInfo?: AuditInfo;
}

export const createAssessmentAttachment = async (
  params: CreateAssessmentAttachmentParams
) => {
  return await AttachmentOps.createAttachment(
    prisma,
    {
      name: params.filename,
      description: params.description,
      fileData: params.fileData,
      fileSize: params.fileData.length,
      assessmentId: params.assessmentId,
      createdBy: params.createdBy,
    },
    params.auditInfo
  );
};

export const getAssessmentAttachments = async (
  assessmentId: string
): Promise<Attachment[]> => {
  return await AttachmentOps.getAssessmentAttachments(prisma, assessmentId);
};

export const deleteAssessmentAttachment = async (
  attachmentId: string,
  auditInfo?: AuditInfo
): Promise<void> => {
  return await AttachmentOps.deleteAttachment(prisma, attachmentId, auditInfo);
};

// Use shared file handling utilities
export const readFile = parseFormData;

export interface UploadAssessmentAttachmentParams {
  assessmentId: string;
  file: formidable.File;
  createdBy: string;
  description?: string;
  auditInfo?: AuditInfo;
}

export const saveFileAsAssessmentAttachment = async (
  params: UploadAssessmentAttachmentParams
): Promise<Attachment> => {
  const fileUpload = await extractFileData(params.file);

  const attachment = await createAssessmentAttachment({
    assessmentId: params.assessmentId,
    filename: fileUpload.filename,
    fileData: fileUpload.fileData,
    createdBy: params.createdBy,
    description: params.description,
    auditInfo: params.auditInfo,
  });

  return attachment;
};

// Use shared file validation
export const checkExtensionAndMIMEType = validateFile;
