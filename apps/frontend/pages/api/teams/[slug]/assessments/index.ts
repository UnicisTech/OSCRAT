import { prisma } from '@/lib/prisma';
import { createAssessment } from '@oscrat/model/operations/assessment';
import { withTeamAuth, type AuthenticatedTeamRequest } from '@/lib/middleware';
import type { NextApiResponse } from 'next';
import type { OscratAssessmentCreate } from '@oscrat/model';
import { ApiError } from '@/lib/errors';

export default function handler(
  req: AuthenticatedTeamRequest,
  res: NextApiResponse
) {
  const { method } = req;

  switch (method) {
    case 'POST':
      return withTeamAuth(['team', 'create'])(handlePOST)(req, res);
    default:
      res.setHeader('Allow', ['POST']);
      throw new ApiError(405, `Method ${method} Not Allowed`);
  }
}

// Create assessment
const handlePOST = async (
  req: AuthenticatedTeamRequest,
  res: NextApiResponse
) => {
  const { teamMember } = req.teamContext;
  const assessmentData = req.body as OscratAssessmentCreate;

  const assessment = await createAssessment(
    prisma,
    teamMember.teamId,
    { ...assessmentData, teamId: teamMember.teamId },
    req.auditInfo
  );

  console.log(
    `[OSCRAT] assessment created, assessmentId: ${assessment.id}, type: ${assessmentData.type}, teamId: ${teamMember.teamId}`
  );

  res.status(201).json({ data: assessment });
};
