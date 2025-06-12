import { getAssessmentDetail, deleteAssessment } from 'models/oscrat';
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
      case 'DELETE':
        await handleDELETE(req, res);
        break;
      default:
        res.setHeader('Allow', ['GET', 'DELETE']);
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

// Get assessment detail
const handleGET = async (req: NextApiRequest, res: NextApiResponse) => {
  const teamMember = await throwIfNoTeamAccess(req, res);
  throwIfNotAllowed(teamMember, 'team', 'read');

  const { projectId, assessmentId } = req.query;

  const assessment = await getAssessmentDetail(
    teamMember.teamId,
    projectId as string,
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
const handleDELETE = async (req: NextApiRequest, res: NextApiResponse) => {
  const teamMember = await throwIfNoTeamAccess(req, res);
  throwIfNotAllowed(teamMember, 'team', 'delete');

  const { projectId, assessmentId } = req.query;

  await deleteAssessment(
    teamMember.teamId,
    projectId as string,
    assessmentId as string
  );

  res.status(200).json({ data: {} });
};
