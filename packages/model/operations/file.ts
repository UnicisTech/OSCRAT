import { PrismaClient, File } from '@prisma/client';

export interface CreateFileParams {
  filename: string;
  fileData: Buffer;
  fileSize: number;
  mimeType?: string;
}

export interface FileData {
  id: string;
  filename: string;
  fileData: Buffer;
  fileSize: number;
  mimeType?: string;
  createdAt: Date;
  updatedAt: Date;
}

export const createFile = async (
  prisma: PrismaClient,
  params: CreateFileParams
): Promise<File> => {
  console.log(`[File Operations] Creating file:`, {
    filename: params.filename,
    fileSize: params.fileSize,
    mimeType: params.mimeType,
  });

  const file = await prisma.file.create({
    data: {
      filename: params.filename,
      fileData: new Uint8Array(params.fileData),
      fileSize: params.fileSize,
      mimeType: params.mimeType,
    },
  });

  console.log(`[File Operations] File created:`, {
    id: file.id,
    filename: file.filename,
    fileSize: file.fileSize,
  });

  return file;
};

export const createFileInTransaction = async (
  tx: any,
  params: CreateFileParams
): Promise<File> => {
  return await tx.file.create({
    data: {
      filename: params.filename,
      fileData: new Uint8Array(params.fileData),
      fileSize: params.fileSize,
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
    filename: file.filename,
    fileData: Buffer.from(file.fileData),
    fileSize: file.fileSize,
    mimeType: file.mimeType ?? undefined,
    createdAt: file.createdAt,
    updatedAt: file.updatedAt,
  };
};

export const getFileData = async (
  prisma: PrismaClient,
  fileId: string
): Promise<{
  filename: string;
  fileData: Buffer;
  mimeType?: string;
} | null> => {
  const file = await prisma.file.findUnique({
    where: { id: fileId },
    select: {
      filename: true,
      fileData: true,
      mimeType: true,
    },
  });

  if (!file) return null;

  return {
    filename: file.filename,
    fileData: Buffer.from(file.fileData),
    mimeType: file.mimeType ?? undefined,
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
