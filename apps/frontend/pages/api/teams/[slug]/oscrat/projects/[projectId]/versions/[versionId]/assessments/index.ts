import { getVersionAssessments, createVersionAssessment } from 'models/oscrat';
import { throwIfNoTeamAccess } from 'models/team';
import { throwIfNotAllowed } from 'models/user';
import type { NextApiRequest, NextApiResponse } from 'next';
import type { OscratAssessmentCreate } from '@oscrat/model';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  try {
    switch (method) {
      case 'GET':
        await handleGET(req, res);
        break;
      case 'POST':
        await handlePOST(req, res);
        break;
      default:
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).json({
          error: { message: `Method ${method} Not Allowed` },
        });
    }
  } catch (error: any) {
    const message = error.message || 'Something went wrong';
    const status = error.status || 500;

    res.status(status).json({ error: { message } });
  }
}

// Get all assessments for a version
const handleGET = async (req: NextApiRequest, res: NextApiResponse) => {
  const teamMember = await throwIfNoTeamAccess(req, res);
  throwIfNotAllowed(teamMember, 'team', 'read');

  const { versionId } = req.query;

  const assessments = await getVersionAssessments(
    teamMember.teamId,
    versionId as string
  );

  res.status(200).json({ data: assessments });
};

// Create assessment for a version
const handlePOST = async (req: NextApiRequest, res: NextApiResponse) => {
  const teamMember = await throwIfNoTeamAccess(req, res);
  throwIfNotAllowed(teamMember, 'team', 'create');

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
