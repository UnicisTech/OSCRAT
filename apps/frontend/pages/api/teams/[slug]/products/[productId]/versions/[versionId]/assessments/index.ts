import { getVersionAssessments, createVersionAssessment } from 'models/oscrat';
import { withAuth, type AuthenticatedRequest } from '@/lib/middleware';
import type { NextApiResponse } from 'next';
import type { OscratAssessmentCreate } from '@oscrat/model';

export default function handler(
  req: AuthenticatedRequest,
  res: NextApiResponse
) {
  const { method } = req;

  switch (method) {
    case 'GET':
      return withAuth(['team', 'read'])(handleGET)(req, res);
    case 'POST':
      return withAuth(['team', 'create'])(handlePOST)(req, res);
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).json({
        error: { message: `Method ${method} Not Allowed` },
      });
  }
}

// Get all assessments for a version
const handleGET = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  const { teamMember } = req.teamContext;

  const { versionId } = req.query;

  const assessments = await getVersionAssessments(
    teamMember.teamId,
    versionId as string
  );

  res.status(200).json({ data: assessments });
};

// Create assessment for a version
const handlePOST = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  const { teamMember } = req.teamContext;

  const { versionId } = req.query;
  const assessmentData = req.body as OscratAssessmentCreate;

  // Add createdBy field from the authenticated user
  const createData: OscratAssessmentCreate = {
    ...assessmentData,
    createdBy: teamMember.userId,
  };

  const assessment = await createVersionAssessment(
    teamMember.teamId,
    versionId as string,
    createData
  );

  res.status(201).json({ data: assessment });
};
