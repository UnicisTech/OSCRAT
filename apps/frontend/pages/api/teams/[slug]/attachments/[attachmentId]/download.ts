import { withTeamAuth, type AuthenticatedTeamRequest } from '@/lib/middleware';
import type { NextApiResponse } from 'next';
import {
  getAttachmentWithFileForTeam,
  getAttachmentLinkedEntity,
} from '@oscrat/model/operations';
import { createAuditContext, CrudType, EntityType } from '@oscrat/model/audit';
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
  const { teamMember } = req.teamContext;
  const { attachmentId } = req.query;

  const attachment = await getAttachmentWithFileForTeam(
    prisma,
    attachmentId as string,
    teamMember.teamId
  );

  if (!attachment) {
    throw new ApiError(404, 'oscrat.ui.validation.attachment-not-found');
  }

  const audit = createAuditContext(prisma, {
    ...req.auditInfo,
    versionId: attachment.versionId ?? req.auditInfo.versionId,
  });
  const linkedEntity = getAttachmentLinkedEntity(attachment);
  const metadata: Record<string, string> = {};
  if (attachment.mimeType) metadata.mimeType = attachment.mimeType;
  if (linkedEntity) {
    metadata.linkedEntityType = linkedEntity.type;
    metadata.linkedEntityId = linkedEntity.id;
  }
  await audit.log({
    action: 'attachment.download',
    crud: CrudType.Read,
    user: audit.user,
    team: audit.team,
    target: {
      id: attachment.id,
      name: attachment.name,
      type: EntityType.Attachment,
    },
    productId: audit.productId,
    versionId: audit.versionId,
    metadata,
  });

  const mimeType = attachment.mimeType || 'application/octet-stream';
  res.setHeader('Content-Type', mimeType);
  res.setHeader(
    'Content-Disposition',
    `attachment; filename*=UTF-8''${encodeURIComponent(attachment.name)}`
  );

  const fileBuffer = Buffer.from(attachment.file.fileData);
  res.status(200).send(fileBuffer);
};
