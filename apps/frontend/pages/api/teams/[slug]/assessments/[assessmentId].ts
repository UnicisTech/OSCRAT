import { prisma } from '@/lib/prisma';
import {
  getAssessmentDetail,
  updateAssessment,
  deleteAssessment,
} from '@oscrat/model/operations/assessment';
import { withTeamAuth, type AuthenticatedTeamRequest } from '@/lib/middleware';
import type { NextApiResponse } from 'next';
import { ApiError } from '@/lib/errors';
import { parseBody } from '@/lib/validation/validateRequest';
import { assessmentUpdateSchema } from '@/lib/validation/assessment';

export default function handler(
  req: AuthenticatedTeamRequest,
  res: NextApiResponse
) {
  const { method } = req;

  switch (method) {
    case 'GET':
      return withTeamAuth(['team', 'read'])(handleGET)(req, res);
    case 'PUT':
      return withTeamAuth(['team', 'update'])(handlePUT)(req, res);
    case 'DELETE':
      return withTeamAuth(['team', 'delete'])(handleDELETE)(req, res);
    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      throw new ApiError(405, `Method ${method} Not Allowed`);
  }
}

// Get assessment detail
const handleGET = async (
  req: AuthenticatedTeamRequest,
  res: NextApiResponse
) => {
  const { teamMember } = req.teamContext;
  const { assessmentId } = req.query;

  const assessment = await getAssessmentDetail(
    prisma,
    teamMember.teamId,
    assessmentId as string
  );

  if (!assessment) {
    throw new ApiError(404, 'Assessment not found');
  }

  res.status(200).json({ data: assessment });
};

// Update assessment
const handlePUT = async (
  req: AuthenticatedTeamRequest,
  res: NextApiResponse
) => {
  const { teamMember } = req.teamContext;
  const { assessmentId } = req.query;

  const assessmentData = await parseBody(assessmentUpdateSchema, req);

  const assessment = await updateAssessment(
    prisma,
    teamMember.teamId,
    assessmentId as string,
    assessmentData,
    req.auditInfo
  );

  console.log(
    `[OSCRAT] assessment updated, assessmentId: ${assessmentId}, teamId: ${teamMember.teamId}`
  );

  res.status(200).json({ data: assessment });
};

// Delete assessment
const handleDELETE = async (
  req: AuthenticatedTeamRequest,
  res: NextApiResponse
) => {
  const { teamMember } = req.teamContext;
  const { assessmentId } = req.query;

  await deleteAssessment(
    prisma,
    teamMember.teamId,
    assessmentId as string,
    req.auditInfo
  );

  console.log(
    `[OSCRAT] assessment deleted, assessmentId: ${assessmentId}, teamId: ${teamMember.teamId}`
  );

  res.status(204).end();
};
