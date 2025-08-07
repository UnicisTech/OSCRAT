import json from '@/components/defaultLanding/data/availableExtensions.json';
import { prisma } from '@/lib/prisma';
import * as AttachmentOps from '@oscrat/model/operations';
import formidable from 'formidable';
import fs from 'fs';
import { NextApiRequest } from 'next';
import { v4 as uuidv4 } from 'uuid';

const availableExtensions = json['availableExtensions'] as any;

export const createAttachment = async (
  taskId: number,
  filename: string,
  fileData: Buffer,
  url: string,
  attachmentId: string
) => {
  return await AttachmentOps.createAttachment(
    prisma,
    taskId,
    filename,
    fileData,
    url,
    attachmentId
  );
};

export const findAttachmentById = async (id: string) => {
  return await AttachmentOps.findAttachmentById(prisma, id);
};

export const deleteAttachment = async (id: string) => {
  return await AttachmentOps.deleteAttachment(prisma, id);
};

// File handling utilities remain in frontend
export const readFile = (
  req: NextApiRequest
): Promise<{ fields: formidable.Fields; files: formidable.Files }> => {
  const options: formidable.Options = {};
  options.maxFileSize = 10 * 1024 * 1024;
  const form = formidable(options);
  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      resolve({ fields, files });
    });
  });
};

export interface UploadAttachmentParams {
  taskId: number;
  file: formidable.File;
}

export const saveFileAsAttachment = async (params: UploadAttachmentParams) => {
  const { filepath: tempPath, originalFilename: filename } = params.file;

  const fileData = await fs.promises.readFile(tempPath);
  const attachmentId = uuidv4();
  const url = `/attachments/${attachmentId}`;

  await createAttachment(
    params.taskId,
    filename as string,
    fileData,
    url,
    attachmentId
  );

  await fs.promises.unlink(tempPath);

  return url;
};

const getFileExtensionFromFileName = (fileName: string) => {
  const lastDotIndex = fileName.lastIndexOf('.');
  if (lastDotIndex !== -1 && lastDotIndex < fileName.length - 1) {
    return fileName.substring(lastDotIndex + 1).toLowerCase();
  }
  return null;
};

export const checkExtensionAndMIMEType = (file: formidable.File) => {
  if (file.originalFilename && file.mimetype) {
    const extension = getFileExtensionFromFileName(file.originalFilename);
    if (extension) {
      const isAllowedExtension = availableExtensions[extension];
      const isAllowedType = availableExtensions[extension] === file.mimetype;
      if (isAllowedExtension && isAllowedType) {
        return true;
      }
    }
  }
  return false;
};
