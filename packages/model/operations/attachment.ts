import { PrismaClient } from '@prisma/client';

/** Create a new attachment */
export const createAttachment = async (
  prisma: PrismaClient,
  taskId: number,
  filename: string,
  fileData: Buffer,
  url: string,
  attachmentId: string
) => {
  return prisma.attachment.create({
    data: {
      taskId,
      filename,
      fileData: new Uint8Array(fileData),
      url,
      id: attachmentId,
    },
  });
};

/** Find attachment by ID */
export const findAttachmentById = async (prisma: PrismaClient, id: string) => {
  return await prisma.attachment.findUnique({
    where: { id },
  });
};

/** Delete an attachment */
export const deleteAttachment = async (prisma: PrismaClient, id: string) => {
  return await prisma.attachment.delete({
    where: {
      id,
    },
  });
};