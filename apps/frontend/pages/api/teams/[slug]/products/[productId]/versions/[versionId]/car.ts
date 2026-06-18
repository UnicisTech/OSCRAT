import formidable from 'formidable';
import {
  uploadVersionCAR,
  deleteVersionCAR,
  getVersionCAR,
  readVersionAttachmentFile,
} from 'models/oscrat';
import { validateDocFile } from '@/lib/utils/docFileValidation';
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

// Get CAR attachment metadata
const handleGET = async (
  req: AuthenticatedTeamRequest,
  res: NextApiResponse
) => {
  const { teamMember } = req.teamContext;
  const { versionId } = req.query;

  const attachment = await getVersionCAR(
    teamMember.teamId,
    versionId as string
  );

  res.status(200).json({ data: attachment, error: null });
};

// Upload CAR (upserts: updates existing or creates new)
const handlePOST = async (
  req: AuthenticatedTeamRequest,
  res: NextApiResponse
) => {
  const { teamMember } = req.teamContext;
  const { versionId } = req.query;

  const { files } = await readVersionAttachmentFile(req);

  const fileFields = Object.values(files);
  if (fileFields.length === 0) {
    throw new ApiError(400, 'oscrat.ui.validation.no-file-uploaded');
  }

  const uploadedFiles = fileFields[0] as formidable.File[];
  if (uploadedFiles.length !== 1) {
    throw new ApiError(400, 'oscrat.ui.validation.exactly-one-file-required');
  }

  const file = uploadedFiles[0];

  if (!validateDocFile(file, 'car')) {
    throw new ApiError(400, 'oscrat.ui.validation.car-invalid-file-type');
  }

  const version = await uploadVersionCAR({
    teamId: teamMember.teamId,
    versionId: versionId as string,
    file,
    createdBy: teamMember.userId,
    audit: req.auditInfo,
  });

  res.status(200).json({
    data: {
      attachment: version.conformityAssessmentReport,
      version,
    },
    error: null,
  });
};

// Delete CAR
const handleDELETE = async (
  req: AuthenticatedTeamRequest,
  res: NextApiResponse
) => {
  const { teamMember } = req.teamContext;
  const { versionId } = req.query;

  const version = await deleteVersionCAR(
    teamMember.teamId,
    versionId as string,
    req.auditInfo
  );

  res.status(200).json({ data: { version }, error: null });
};
