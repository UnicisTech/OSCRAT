import { PrismaClient, File } from '@prisma/client';

export interface CreateFileParams {
  fileData: Buffer;
  fileSize?: number; // Optional, will calculate from buffer if not provided
  mimeType?: string;
}

// Simple interface for file data operations (pure storage)
export interface FileData {
  id: string;
  fileData: Buffer;
  createdAt: Date;
  updatedAt: Date;
}

export const createFile = async (
  prisma: PrismaClient,
  params: CreateFileParams
): Promise<File> => {
  console.log(`[File Operations] Creating file:`, {
    fileSize: params.fileData.length,
  });

  const file = await prisma.file.create({
    data: {
      fileData: new Uint8Array(params.fileData),
      fileSize: params.fileSize ?? params.fileData.length,
      mimeType: params.mimeType,
    },
  });

  console.log(`[File Operations] File created:`, {
    id: file.id,
  });

  return file;
};

export const createFileInTransaction = async (
  tx: any,
  params: CreateFileParams
): Promise<File> => {
  return await tx.file.create({
    data: {
      fileData: new Uint8Array(params.fileData),
      fileSize: params.fileSize ?? params.fileData.length,
      mimeType: params.mimeType,
    },
  });
};

export const getFileById = async (
  prisma: PrismaClient,
  fileId: string
): Promise<FileData | null> => {
  const file = await prisma.file.findUnique({
    where: { id: fileId },
  });

  if (!file) return null;

  return {
    id: file.id,
    fileData: Buffer.from(file.fileData),
    createdAt: file.createdAt,
    updatedAt: file.updatedAt,
  };
};

export const getFileData = async (
  prisma: PrismaClient,
  fileId: string
): Promise<{
  fileData: Buffer;
} | null> => {
  const file = await prisma.file.findUnique({
    where: { id: fileId },
    select: {
      fileData: true,
    },
  });

  if (!file) return null;

  return {
    fileData: Buffer.from(file.fileData),
  };
};

export const deleteFile = async (
  prisma: PrismaClient,
  fileId: string
): Promise<void> => {
  console.log(`[File Operations] Deleting file: ${fileId}`);

  await prisma.file.delete({
    where: { id: fileId },
  });

  console.log(`[File Operations] File deleted: ${fileId}`);
};

