import { withTeamAuth, type AuthenticatedTeamRequest } from '@/lib/middleware';
import type { NextApiResponse } from 'next';
import { ApiError } from '@/lib/errors';
import { getDocumentation, updateDocumentation, deleteDocumentation } from 'models/documentation';
import { documentationUpdateSchema } from '@/lib/validation/documentation';
import { validateRequest } from '@/lib/validation/validateRequest';

export default function handler(
  req: AuthenticatedTeamRequest,
  res: NextApiResponse
) {
  const { method } = req;

  switch (method) {
    case 'GET':
      return withTeamAuth(['documentation', 'read'])(handleGET)(req, res);
    case 'PUT':
      return withTeamAuth(['documentation', 'update'])(handlePUT)(req, res);
    case 'DELETE':
      return withTeamAuth(['documentation', 'delete'])(handleDELETE)(req, res);
    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      throw new ApiError(405, `Method ${method} Not Allowed`);
  }
}

const handleGET = async (
  req: AuthenticatedTeamRequest,
  res: NextApiResponse
) => {
  const { teamMember } = req.teamContext;
  const { docId } = req.query;

  const doc = await getDocumentation(teamMember.teamId, docId as string);

  if (!doc) {
    throw new ApiError(404, 'Documentation not found');
  }

  return res.status(200).json({ data: doc, error: null });
};

const handlePUT = async (
  req: AuthenticatedTeamRequest,
  res: NextApiResponse
) => {
  const { teamMember, user } = req.teamContext;
  const { docId } = req.query;

  const validatedData = await validateRequest(
    documentationUpdateSchema,
    req.body
  );

  const doc = await updateDocumentation(
    teamMember.teamId,
    docId as string,
    user.id,
    {
      title: validatedData.title,
      content: validatedData.content,
      visibility: validatedData.visibility,
      status: validatedData.status,
    },
    req.auditInfo
  );

  if (!doc) {
    throw new ApiError(404, 'Documentation not found');
  }

  return res.status(200).json({ data: doc, error: null });
};

const handleDELETE = async (
  req: AuthenticatedTeamRequest,
  res: NextApiResponse
) => {
  const { teamMember } = req.teamContext;
  const { docId } = req.query;

  // Will throw if not found (Prisma handles it)
  await deleteDocumentation(teamMember.teamId, docId as string, req.auditInfo);

  return res.status(200).json({ data: { success: true }, error: null });
};
