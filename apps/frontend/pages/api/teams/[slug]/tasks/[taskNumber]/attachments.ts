import formidable from 'formidable';
import fs from 'fs';
import {
  deleteAttachment,
  findAttachmentById,
  readFile,
  saveFileAsAttachment,
} from 'models/attachment';
import { checkExtensionAndMIMEType } from 'models/attachment';
import { withAuth, type AuthenticatedRequest } from '@/lib/middleware';
import type { NextApiResponse } from 'next';
import path from 'path';
import { promisify } from 'util';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default function handler(
  req: AuthenticatedRequest,
  res: NextApiResponse
) {
  const { method } = req;

  switch (method) {
    case 'GET':
      return withAuth(['task', 'read'])(handleGET)(req, res);
    case 'POST':
      return withAuth(['task', 'update'])(handlePOST)(req, res);
    case 'DELETE':
      return withAuth(['task', 'update'])(handleDELETE)(req, res);
    default:
      res.setHeader('Allow', ['GET', 'DELETE', 'POST']);
      res.status(405).json({
        data: null,
        error: { message: `Method ${method} Not Allowed` },
      });
  }
}

// Download an attachment
const handleGET = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  const { teamMember } = req.teamContext;

  const { id } = req.query;

  try {
    const attachment = await findAttachmentById(id as string);

    if (!attachment) {
      return res.status(200).json({
        data: null,
        error: { message: 'Attachment not found.' },
      });
    }

    const fileData = attachment.fileData;
    const filename = attachment.filename;

    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`
    );

    const writeFileAsync = promisify(fs.writeFile);
    const tempFilePath = path.join('/tmp', filename);

    await writeFileAsync(tempFilePath, fileData);

    const fileStream = fs.createReadStream(tempFilePath);

    fileStream.pipe(res);

    fileStream.on('close', async () => {
      await fs.promises.unlink(tempFilePath);
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      data: null,
      error: { message: 'Internal server error.' },
    });
  }
};

// Upload an attachment
const handlePOST = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  const { teamMember } = req.teamContext;

  try {
    const { fields, files } = await readFile(req);
    const { taskId } = fields;

    const file = Object.values(files)[0] as formidable.File[];

    const isAllowed = checkExtensionAndMIMEType(file[0] as formidable.File);

    if (isAllowed) {
      try {
        const uploadParams = {
          taskId: Number(taskId),
          file: file[0],
        };

        const url = await saveFileAsAttachment(uploadParams);
        res.status(200).json({ url });
      } catch (error) {
        console.error('Failed to save file as attachment:', error);
        res
          .status(500)
          .json({ error: { message: 'Failed to save file as attachment.' } });
      }
    } else {
      res
        .status(200)
        .json({ error: { message: 'Not supported type of file.' } });
    }
  } catch (e) {
    res.status(200).json({
      error: { message: 'File is too large. Maximum size of file is 10mb.' },
    });
  }
};

// Delete a comment

const handleDELETE = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  const { teamMember } = req.teamContext;

  const { id } = req.query;

  await deleteAttachment(id as string);

  return res.status(200).json({ data: {}, error: null });
};
