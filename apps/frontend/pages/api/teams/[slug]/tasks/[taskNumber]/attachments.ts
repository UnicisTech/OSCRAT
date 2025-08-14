import formidable from 'formidable';
import {
  deleteAttachment,
  readFile,
  saveFileAsAttachment,
} from 'models/attachment';
import { checkExtensionAndMIMEType } from 'models/attachment';
import { withTeamAuth, type AuthenticatedTeamRequest } from '@/lib/middleware';
import type { NextApiResponse } from 'next';
import { getTaskBySlugAndNumber } from 'models/task';

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
      return withTeamAuth(['task', 'read'])(handleGET)(req, res);
    case 'POST':
      return withTeamAuth(['task', 'update'])(handlePOST)(req, res);
    case 'DELETE':
      return withTeamAuth(['task', 'update'])(handleDELETE)(req, res);
    default:
      res.setHeader('Allow', ['GET', 'DELETE', 'POST']);
      res.status(405).json({
        data: null,
        error: { message: `Method ${method} Not Allowed` },
      });
  }
}

// Get task attachments
const handleGET = async (req: AuthenticatedTeamRequest, res: NextApiResponse) => {
  const { teamMember } = req.teamContext;
  const { slug, taskNumber } = req.query;

  try {
    const task = await getTaskBySlugAndNumber(
      parseInt(taskNumber as string, 10),
      slug as string
    );

    if (!task) {
      return res.status(404).json({
        data: null,
        error: { message: 'Task not found.' },
      });
    }

    // Task should have attachments included from the model function
    res.status(200).json({
      data: task.attachments || [],
      error: null,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      data: null,
      error: { message: 'Internal server error.' },
    });
  }
};

// Upload an attachment
const handlePOST = async (req: AuthenticatedTeamRequest, res: NextApiResponse) => {
  const { teamMember } = req.teamContext;

  try {
    const { fields, files } = await readFile(req);
    const { taskId, description } = fields;

    const file = Object.values(files)[0] as formidable.File[];

    const isAllowed = checkExtensionAndMIMEType(file[0] as formidable.File);

    if (isAllowed) {
      try {
        const uploadParams = {
          taskId: Number(taskId),
          file: file[0],
          description: Array.isArray(description) ? description[0] : description,
          createdBy: teamMember.userId,
        };

        const url = await saveFileAsAttachment(uploadParams);
        res.status(200).json({ data: { url }, error: null });
      } catch (error) {
        console.error('Failed to save file as attachment:', error);
        res
          .status(500)
          .json({ data: null, error: { message: 'Failed to save file as attachment.' } });
      }
    } else {
      res
        .status(400)
        .json({ data: null, error: { message: 'Not supported type of file.' } });
    }
  } catch (e) {
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

  await deleteAttachment(id as string);

  return res.status(200).json({ data: {}, error: null });
};
