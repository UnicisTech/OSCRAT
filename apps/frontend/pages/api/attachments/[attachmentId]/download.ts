import { withTeamAuth, type AuthenticatedTeamRequest } from '@/lib/middleware';
import type { NextApiResponse } from 'next';
import { getAttachmentWithFileById } from '@oscrat/model/operations';
import { prisma } from '@/lib/prisma';
import { ApiError } from '@/lib/errors';

export default function handler(
  req: AuthenticatedTeamRequest,
  res: NextApiResponse
) {
  const { method } = req;

  switch (method) {
    case 'GET':
      return withTeamAuth(['team', 'read'])(handleGET)(req, res);
    default:
      res.setHeader('Allow', ['GET']);
      res.status(405).json({
        data: null,
        error: { message: `Method ${method} Not Allowed` },
      });
  }
}

const handleGET = async (
  req: AuthenticatedTeamRequest,
  res: NextApiResponse
) => {
  const { attachmentId } = req.query;

  const attachment = await getAttachmentWithFileById(prisma, attachmentId as string);

  if (!attachment) {
    throw new ApiError(404, 'oscrat.ui.validation.attachment-not-found');
  }

  // TODO: Implement proper access control based on attachment's linked entity
  // For now, rely on team auth middleware for basic access control

  const mimeType = attachment.mimeType || 'application/octet-stream';
  res.setHeader('Content-Type', mimeType);
  res.setHeader(
    'Content-Disposition',
    `attachment; filename*=UTF-8''${encodeURIComponent(attachment.name)}`
  );

  const fileBuffer = Buffer.from(attachment.file.fileData);
  res.status(200).send(fileBuffer);
};
