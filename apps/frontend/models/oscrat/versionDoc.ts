import { prisma } from '@/lib/prisma';
import {
  upsertVersionCAR,
  upsertVersionDoC,
  removeVersionCAR,
  removeVersionDoC,
  getVersionCARAttachmentId,
  getVersionDoCAttachmentId,
} from '@oscrat/model/operations/version';
import { getAttachmentById } from '@oscrat/model/operations/attachment';
import { extractFileData } from '@/lib/utils/fileUpload';
import formidable from 'formidable';
import type { OscratProductVersionDetail, Attachment, AuditInfo } from '@oscrat/model';

export interface UploadVersionCARParams {
  teamId: string;
  versionId: string;
  file: formidable.File;
  createdBy: string;
  audit: AuditInfo;
}

export const uploadVersionCAR = async (
  params: UploadVersionCARParams
): Promise<OscratProductVersionDetail> => {
  const fileUpload = await extractFileData(params.file);

  return await upsertVersionCAR(prisma, params.teamId, params.versionId, {
    name: fileUpload.filename,
    fileData: fileUpload.fileData,
    fileSize: fileUpload.fileData.length,
    mimeType: params.file.mimetype || undefined,
    createdBy: params.createdBy,
  }, params.audit);
};

export const deleteVersionCAR = async (
  teamId: string,
  versionId: string,
  audit: AuditInfo
): Promise<OscratProductVersionDetail> => {
  return await removeVersionCAR(prisma, teamId, versionId, audit);
};

export const getVersionCAR = async (
  teamId: string,
  versionId: string
): Promise<Attachment | null> => {
  const attachmentId = await getVersionCARAttachmentId(prisma, teamId, versionId);
  if (!attachmentId) return null;
  return await getAttachmentById(prisma, attachmentId);
};

export interface UploadVersionDoCParams {
  teamId: string;
  versionId: string;
  file: formidable.File;
  createdBy: string;
  updateStatusToSupported?: boolean;
  audit: AuditInfo;
}

export const uploadVersionDoC = async (
  params: UploadVersionDoCParams
): Promise<OscratProductVersionDetail> => {
  const fileUpload = await extractFileData(params.file);

  return await upsertVersionDoC(prisma, params.teamId, params.versionId, {
    name: fileUpload.filename,
    fileData: fileUpload.fileData,
    fileSize: fileUpload.fileData.length,
    mimeType: 'application/pdf',
    createdBy: params.createdBy,
    updateStatusToSupported: params.updateStatusToSupported,
  }, params.audit);
};

export const deleteVersionDoC = async (
  teamId: string,
  versionId: string,
  audit: AuditInfo
): Promise<OscratProductVersionDetail> => {
  return await removeVersionDoC(prisma, teamId, versionId, audit);
};

export const getVersionDoC = async (
  teamId: string,
  versionId: string
): Promise<Attachment | null> => {
  const attachmentId = await getVersionDoCAttachmentId(prisma, teamId, versionId);
  if (!attachmentId) return null;
  return await getAttachmentById(prisma, attachmentId);
};
