import formidable from 'formidable';
import {
  deleteAssessmentAttachment,
  readAssessmentAttachmentFile,
  saveFileAsAssessmentAttachment,
  checkAssessmentAttachmentFile,
  getAssessmentAttachments,
} from 'models/oscrat';
import { getAssessmentDetail } from '@oscrat/model/operations/assessment';
import { prisma } from '@/lib/prisma';
import { handleFormidableError } from '@/lib/utils/fileUpload';
import { getFirstFieldValue } from '@/lib/utils/forms';
import { withTeamAuth, type AuthenticatedTeamRequest } from '@/lib/middleware';
import { ApiError } from '@/lib/errors';
import type { NextApiResponse } from 'next';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default function handler(
  req: AuthenticatedTeamRequest,
  res: NextApiResponse
) {
  const { method } = req;

  switch (method) {
    case 'GET':
      return withTeamAuth(['team', 'read'])(handleGET)(req, res);
    case 'POST':
      return withTeamAuth(['team', 'update'])(handlePOST)(req, res);
    case 'DELETE':
      return withTeamAuth(['team', 'update'])(handleDELETE)(req, res);
    default:
      res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
      res.status(405).json({
        data: null,
        error: { message: `Method ${method} Not Allowed` },
      });
  }
}

// Ensure the assessment exists and belongs to the requesting team.
const assertAssessmentInTeam = async (teamId: string, assessmentId: string) => {
  const assessment = await getAssessmentDetail(prisma, teamId, assessmentId);
  if (!assessment) {
    throw new ApiError(404, 'Assessment not found');
  }
};

// Get assessment attachments
const handleGET = async (
  req: AuthenticatedTeamRequest,
  res: NextApiResponse
) => {
  const { teamMember } = req.teamContext;
  const { assessmentId } = req.query;

  try {
    await assertAssessmentInTeam(teamMember.teamId, assessmentId as string);

    const attachments = await getAssessmentAttachments(assessmentId as string);

    res.status(200).json({
      data: attachments,
      error: null,
    });
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    console.error('Error handling GET request:', error);
    res.status(500).json({
      data: null,
      error: { message: 'Internal server error.' },
    });
  }
};

// Upload a new attachment to an assessment
const handlePOST = async (
  req: AuthenticatedTeamRequest,
  res: NextApiResponse
) => {
  const { teamMember } = req.teamContext;
  const { assessmentId } = req.query;

  try {
    await assertAssessmentInTeam(teamMember.teamId, assessmentId as string);

    const { fields, files } = await readAssessmentAttachmentFile(req);

    const fileFields = Object.values(files);
    if (fileFields.length === 0) {
      throw new ApiError(400, 'No file uploaded');
    }

    const file = fileFields[0] as formidable.File[];

    const isAllowed = checkAssessmentAttachmentFile(file[0] as formidable.File);

    if (!isAllowed) {
      throw new ApiError(400, 'Not supported type of file.');
    }

    const attachment = await saveFileAsAssessmentAttachment({
      assessmentId: assessmentId as string,
      file: file[0],
      createdBy: teamMember.userId,
      description: getFirstFieldValue(fields.description),
      auditInfo: req.auditInfo,
    });

    res.status(200).json({
      data: attachment,
      error: null,
    });
  } catch (error: any) {
    console.error('File upload error:', error);

    if (error instanceof ApiError) {
      throw error;
    }

    handleFormidableError(error, 10);
  }
};

// Delete an attachment
const handleDELETE = async (
  req: AuthenticatedTeamRequest,
  res: NextApiResponse
) => {
  const { teamMember } = req.teamContext;
  const { id } = req.query;

  try {
    if (!id) {
      return res.status(400).json({
        data: null,
        error: { message: 'Attachment ID is required.' },
      });
    }

    await deleteAssessmentAttachment(
      id as string,
      teamMember.teamId,
      req.auditInfo
    );

    return res.status(200).json({
      data: {},
      error: null,
    });
  } catch (error) {
    console.error('Error deleting attachment:', error);
    res.status(500).json({
      data: null,
      error: { message: 'Failed to delete attachment.' },
    });
  }
};
