import formidable from 'formidable';
import {
  deleteVersionAttachment,
  readVersionAttachmentFile,
  saveFileAsVersionAttachment,
  checkVersionAttachmentFile,
  getVersionAttachments,
} from 'models/oscrat';
import { withTeamAuth, type AuthenticatedTeamRequest } from '@/lib/middleware';
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

// Get version attachments
const handleGET = async (req: AuthenticatedTeamRequest, res: NextApiResponse) => {
  const { teamMember } = req.teamContext;
  const { versionId } = req.query;

  try {
    const attachments = await getVersionAttachments(versionId as string);

    res.status(200).json({
      data: attachments,
      error: null,
    });
  } catch (error) {
    console.error('Error handling GET request:', error);
    res.status(500).json({
      data: null,
      error: { message: 'Internal server error.' },
    });
  }
};

// Upload a new attachment to version
const handlePOST = async (req: AuthenticatedTeamRequest, res: NextApiResponse) => {
  const { teamMember } = req.teamContext;
  const { versionId } = req.query;

  try {
    const { fields, files } = await readVersionAttachmentFile(req);

    const file = Object.values(files)[0] as formidable.File[];

    const isAllowed = checkVersionAttachmentFile(file[0] as formidable.File);

    if (isAllowed) {
      try {
        const uploadParams = {
          versionId: versionId as string,
          file: file[0],
          createdBy: teamMember.userId,
          description: fields.description?.[0] as string | undefined,
        };

        const url = await saveFileAsVersionAttachment(uploadParams);
        res.status(200).json({ 
          data: { url }, 
          error: null 
        });
      } catch (error) {
        console.error('Failed to save file as version attachment:', error);
        res.status(500).json({ 
          data: null,
          error: { message: 'Failed to save file as attachment.' } 
        });
      }
    } else {
      res.status(400).json({ 
        data: null,
        error: { message: 'Not supported type of file.' } 
      });
    }
  } catch (e) {
    console.error('File upload error:', e);
    res.status(400).json({
      data: null,
      error: { message: 'File is too large. Maximum size of file is 10mb.' },
    });
  }
};

// Delete an attachment
const handleDELETE = async (req: AuthenticatedTeamRequest, res: NextApiResponse) => {
  const { teamMember } = req.teamContext;
  const { id } = req.query;

  try {
    if (!id) {
      return res.status(400).json({
        data: null,
        error: { message: 'Attachment ID is required.' },
      });
    }

    await deleteVersionAttachment(id as string);

    return res.status(200).json({ 
      data: {}, 
      error: null 
    });
  } catch (error) {
    console.error('Error deleting attachment:', error);
    res.status(500).json({
      data: null,
      error: { message: 'Failed to delete attachment.' },
    });
  }
};