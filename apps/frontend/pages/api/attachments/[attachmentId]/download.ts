import { withTeamAuth, type AuthenticatedTeamRequest } from '@/lib/middleware';
import type { NextApiResponse } from 'next';
import { findAttachmentById } from 'models/attachment';

export default function handler(
  req: AuthenticatedTeamRequest,
  res: NextApiResponse
) {
  const { method } = req;

  switch (method) {
    case 'GET':
      return withTeamAuth(['task', 'read'])(handleGET)(req, res);
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
  const { teamMember } = req.teamContext;
  const { attachmentId } = req.query;

  try {
    const attachment = await findAttachmentById(attachmentId as string);

    if (!attachment) {
      return res.status(404).json({
        data: null,
        error: { message: 'Attachment not found.' },
      });
    }

    // TODO: Add permission verification
    if (attachment.taskId) {
      // TODO: Implement task permission check
    } else if (attachment.versionId) {
      // TODO: Implement version permission check
    } else if (attachment.sbomReportId) {
      // TODO: Implement SBOM report permission check
    } else {
      return res.status(400).json({
        data: null,
        error: { message: 'Invalid attachment type.' },
      });
    }

    const mimeType = attachment.mimeType || 'application/octet-stream';
    res.setHeader('Content-Type', mimeType);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename*=UTF-8''${encodeURIComponent(attachment.name)}`
    );

    // Stream the file data directly without temporary files
    res.status(200).send(attachment.file.fileData);
  } catch (error) {
    console.error('Error downloading attachment:', error);
    res.status(500).json({
      data: null,
      error: { message: 'Internal server error.' },
    });
  }
};
