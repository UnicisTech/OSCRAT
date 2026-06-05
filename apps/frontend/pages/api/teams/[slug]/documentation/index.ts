import { withTeamAuth, type AuthenticatedTeamRequest } from '@/lib/middleware';
import type { NextApiResponse } from 'next';
import { ApiError } from '@/lib/errors';
import { createDocumentation, listDocumentation } from 'models/documentation';
import { DocumentationStatus, DocumentationVisibility } from '@oscrat/model';
import { documentationCreateSchema, documentationFilterSchema } from '@/lib/validation/documentation';
import { validateRequest } from '@/lib/validation/validateRequest';

export default function handler(
  req: AuthenticatedTeamRequest,
  res: NextApiResponse
) {
  const { method } = req;

  switch (method) {
    case 'GET':
      return withTeamAuth(['documentation', 'read'])(handleGET)(req, res);
    case 'POST':
      return withTeamAuth(['documentation', 'create'])(handlePOST)(req, res);
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      throw new ApiError(405, `Method ${method} Not Allowed`);
  }
}

const handleGET = async (
  req: AuthenticatedTeamRequest,
  res: NextApiResponse
) => {
  const { teamMember } = req.teamContext;

  const filter = await validateRequest(documentationFilterSchema, req.query);
  const docs = await listDocumentation(teamMember.teamId, filter);
  return res.status(200).json({ data: docs, error: null });
};

const handlePOST = async (
  req: AuthenticatedTeamRequest,
  res: NextApiResponse
) => {
  const { teamMember, user } = req.teamContext;

  const validatedData = await validateRequest(
    documentationCreateSchema,
    req.body
  );

  const doc = await createDocumentation(
    teamMember.teamId,
    user.id,
    {
      title: validatedData.title,
      content: validatedData.content || '',
      visibility: validatedData.visibility || DocumentationVisibility.PRIVATE,
      status: validatedData.status || DocumentationStatus.DRAFT,
      productId: validatedData.productId,
      versionId: validatedData.versionId,
    },
    req.auditInfo
  );

  return res.status(201).json({ data: doc, error: null });
};
