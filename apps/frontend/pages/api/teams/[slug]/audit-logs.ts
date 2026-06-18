import { prisma } from '@/lib/prisma';
import { getAuditLogs } from '@oscrat/model/operations';
import { withTeamAuth, type AuthenticatedTeamRequest } from '@/lib/middleware';
import type { NextApiResponse } from 'next';
import { ApiError } from '@/lib/errors';
import { auditLogQuerySchema } from '@/lib/validation/auditLog';
import * as Yup from 'yup';

export default function handler(
  req: AuthenticatedTeamRequest,
  res: NextApiResponse
) {
  const { method } = req;

  switch (method) {
    case 'POST':
      return withTeamAuth(['team_audit_log', 'read'])(handlePOST)(req, res);
    default:
      res.setHeader('Allow', ['POST']);
      throw new ApiError(405, `Method ${method} Not Allowed`);
  }
}

const handlePOST = async (
  req: AuthenticatedTeamRequest,
  res: NextApiResponse
) => {
  const { teamMember } = req.teamContext;

  try {
    const validatedParams = await auditLogQuerySchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    const result = await getAuditLogs(
      prisma,
      teamMember.teamId,
      validatedParams
    );
    res.status(200).json({ data: result });
  } catch (error) {
    if (error instanceof Yup.ValidationError) {
      return res.status(400).json({
        error: {
          message: 'Validation failed',
          fields: error.inner.map((e) => ({
            path: e.path,
            message: e.message,
          })),
        },
      });
    }
    throw error;
  }
};
