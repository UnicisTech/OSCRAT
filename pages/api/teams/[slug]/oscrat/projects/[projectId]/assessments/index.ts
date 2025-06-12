import { getAssessments, createAssessment } from 'models/oscrat';
import { throwIfNoTeamAccess } from 'models/team';
import { throwIfNotAllowed } from 'models/user';
import type { NextApiRequest, NextApiResponse } from 'next';

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

// Get all assessments for a project
const handleGET = async (req: NextApiRequest, res: NextApiResponse) => {
  const teamMember = await throwIfNoTeamAccess(req, res);
  throwIfNotAllowed(teamMember, 'team', 'read');

  const { projectId } = req.query;

  const assessments = await getAssessments(
    teamMember.teamId,
    projectId as string
  );

  res.status(200).json({ data: assessments });
};

// Create assessment for a project
const handlePOST = async (req: NextApiRequest, res: NextApiResponse) => {
  const teamMember = await throwIfNoTeamAccess(req, res);
  throwIfNotAllowed(teamMember, 'team', 'create');

  const { projectId } = req.query;
  const assessmentData = req.body;

  const assessment = await createAssessment(
    teamMember.teamId,
    projectId as string,
    assessmentData
  );

  res.status(201).json({ data: assessment });
};
