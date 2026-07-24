import { prisma } from '@/lib/prisma';
import * as AttachmentOps from '@oscrat/model/operations/attachment';
import {
  assertVersionInTeam,
  assertVulnerabilityInVersion,
  assertIncidentInVersion,
} from '@oscrat/model/operations';
import {
  parseFormData,
  validateFile,
  extractFileData,
} from '@/lib/utils/fileUpload';
import formidable from 'formidable';
import type { Attachment } from '@oscrat/model';
import type { AttachmentEntityFilters } from '@oscrat/model/types/attachments';
import type { AuditInfo } from '@oscrat/model/audit';

export interface CreateVersionAttachmentParams {
  versionId: string;
  teamId: string;
  filename: string;
  fileData: Buffer;
  createdBy: string;
  description?: string;
  vulnerabilityId?: string;
  incidentId?: string;
  auditInfo?: AuditInfo;
}

export const createVersionAttachment = async (
  params: CreateVersionAttachmentParams
) => {
  await assertVersionInTeam(prisma, params.versionId, params.teamId);
  await assertVulnerabilityInVersion(
    prisma,
    params.vulnerabilityId,
    params.versionId
  );
  await assertIncidentInVersion(prisma, params.incidentId, params.versionId);

  return await AttachmentOps.createAttachment(
    prisma,
    {
      name: params.filename,
      description: params.description,
      fileData: params.fileData,
      fileSize: params.fileData.length,
      versionId: params.versionId,
      createdBy: params.createdBy,
      vulnerabilityId: params.vulnerabilityId,
      incidentId: params.incidentId,
    },
    params.auditInfo
  );
};

export const getVersionAttachments = async (
  versionId: string,
  teamId: string,
  productId: string,
  filters?: AttachmentEntityFilters
): Promise<Attachment[]> => {
  return await AttachmentOps.getVersionAttachments(
    prisma,
    versionId,
    teamId,
    productId,
    filters
  );
};

export const deleteVersionAttachment = async (
  attachmentId: string,
  teamId: string,
  auditInfo?: AuditInfo
): Promise<void> => {
  return await AttachmentOps.deleteAttachment(
    prisma,
    attachmentId,
    teamId,
    auditInfo
  );
};

// Use shared file handling utilities
export const readFile = parseFormData;

export interface UploadVersionAttachmentParams {
  versionId: string;
  teamId: string;
  file: formidable.File;
  createdBy: string;
  description?: string;
  vulnerabilityId?: string;
  incidentId?: string;
  auditInfo?: AuditInfo;
}

export const saveFileAsVersionAttachment = async (
  params: UploadVersionAttachmentParams
): Promise<Attachment> => {
  const fileUpload = await extractFileData(params.file);

  const attachment = await createVersionAttachment({
    versionId: params.versionId,
    teamId: params.teamId,
    filename: fileUpload.filename,
    fileData: fileUpload.fileData,
    createdBy: params.createdBy,
    description: params.description,
    vulnerabilityId: params.vulnerabilityId,
    incidentId: params.incidentId,
    auditInfo: params.auditInfo,
  });

  return attachment;
};

// Use shared file validation
export const checkExtensionAndMIMEType = validateFile;
