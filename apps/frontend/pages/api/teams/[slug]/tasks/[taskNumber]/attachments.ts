import formidable from 'formidable';
import {
  deleteAttachment,
  readFile,
  saveFileAsAttachment,
} from 'models/attachment';
import { checkExtensionAndMIMEType } from 'models/attachment';
import { handleFormidableError } from '@/lib/utils/fileUpload';
import { withTeamAuth, type AuthenticatedTeamRequest } from '@/lib/middleware';
import { ApiError } from '@/lib/errors';
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
const handleGET = async (
  req: AuthenticatedTeamRequest,
  res: NextApiResponse
) => {
  const { teamMember } = req.teamContext;
  const { slug, taskNumber } = req.query;

  try {
    const task = await getTaskBySlugAndNumber(
      parseInt(taskNumber as string, 10),
      slug as string
    );

    if (!task) {
      throw new ApiError(404, 'Task not found');
    }

    // Task should have attachments included from the model function
    res.status(200).json({
      data: task.attachments || [],
      error: null,
    });
  } catch (error: any) {
    console.error('Error handling GET request:', error);

    if (error instanceof ApiError) {
      throw error;
    }

    res.status(500).json({
      data: null,
      error: { message: 'Internal server error' },
    });
  }
};

// Upload an attachment
const handlePOST = async (
  req: AuthenticatedTeamRequest,
  res: NextApiResponse
) => {
  const { teamMember } = req.teamContext;

  try {
    const { fields, files } = await readFile(req);
    const { taskId, description } = fields;

    const file = Object.values(files)[0] as formidable.File[];
    if (!file?.[0]) {
      throw new ApiError(400, 'No file uploaded');
    }

    const isAllowed = checkExtensionAndMIMEType(file[0] as formidable.File);

    if (isAllowed) {
      try {
        const uploadParams = {
          taskId: Number(taskId),
          file: file[0],
          description: Array.isArray(description)
            ? description[0]
            : description,
          createdBy: teamMember.userId,
        };

        const url = await saveFileAsAttachment(uploadParams);
        res.status(200).json({ data: { url }, error: null });
      } catch (error) {
        console.error('Failed to save file as attachment:', error);
        throw new ApiError(500, 'Failed to save file as attachment');
      }
    } else {
      throw new ApiError(400, 'Not supported type of file');
    }
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
      throw new ApiError(400, 'Attachment ID is required');
    }

    await deleteAttachment(id as string);

    return res.status(200).json({ data: {}, error: null });
  } catch (error: any) {
    console.error('Error deleting attachment:', error);

    if (error instanceof ApiError) {
      throw error;
    }

    res.status(500).json({
      data: null,
      error: { message: 'Failed to delete attachment' },
    });
  }
};
