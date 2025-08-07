import {
  getVersionAssessmentDetail,
  deleteVersionAssessment,
} from 'models/oscrat';
import { withAuth, type AuthenticatedRequest } from '@/lib/middleware';
import type { NextApiResponse } from 'next';

export default function handler(
  req: AuthenticatedRequest,
  res: NextApiResponse
) {
  const { method } = req;

  switch (method) {
    case 'GET':
      return withAuth(['team', 'read'])(handleGET)(req, res);
    case 'DELETE':
      return withAuth(['team', 'delete'])(handleDELETE)(req, res);
    default:
      res.setHeader('Allow', ['GET', 'DELETE']);
      res.status(405).json({
        error: { message: `Method ${method} Not Allowed` },
      });
  }
}

// Get assessment detail
const handleGET = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  const { teamMember } = req.teamContext;

  const { versionId, assessmentId } = req.query;

  const assessment = await getVersionAssessmentDetail(
    teamMember.teamId,
    versionId as string,
    assessmentId as string
  );

  if (!assessment) {
    return res.status(404).json({
      error: { message: 'Assessment not found' },
    });
  }

  res.status(200).json({ data: assessment });
};

// Delete assessment
const handleDELETE = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  const { teamMember } = req.teamContext;

  const { versionId, assessmentId } = req.query;

  await deleteVersionAssessment(
    teamMember.teamId,
    versionId as string,
    assessmentId as string
  );

  res.status(200).json({ data: {} });
};
