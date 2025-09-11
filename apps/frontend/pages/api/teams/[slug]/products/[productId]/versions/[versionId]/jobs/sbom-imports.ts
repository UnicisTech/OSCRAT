import formidable from 'formidable';
import { createFileImportSbomJob } from '@oscrat/model/operations/workerJob';
import { extractFileData, handleFormidableError } from '@/lib/utils/fileUpload';
import { prisma } from '@/lib/prisma';
import { withTeamAuth, type AuthenticatedTeamRequest } from '@/lib/middleware';
import type { NextApiResponse } from 'next';
import { ApiError } from '@/lib/errors';

const ALLOWED_MIME_TYPES = ['application/xml', 'text/xml'];
const MAX_SBOM_FILE_SIZE = 100 * 1024 * 1024; // 100MB

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
    case 'POST':
      return withTeamAuth(['team', 'create'])(handlePOST)(req, res);
    default:
      res.setHeader('Allow', ['POST']);
      throw new ApiError(405, `Method ${method} Not Allowed`);
  }
}

// Create a new file-based SBOM import job
const handlePOST = async (
  req: AuthenticatedTeamRequest,
  res: NextApiResponse
) => {
  const { teamMember } = req.teamContext;
  const { productId, versionId } = req.query;

  // Validate query parameters
  if (!productId || !versionId) {
    throw new ApiError(400, 'Product ID and Version ID are required');
  }

  try {
    // Parse the multipart form data
    const form = formidable({
      maxFileSize: MAX_SBOM_FILE_SIZE,
    });

    const [, files] = await form.parse(req);

    // Extract file (consistent with other attachment endpoints)
    const file = Object.values(files)[0] as formidable.File[];
    if (!file?.[0]) {
      throw new ApiError(400, 'No file uploaded');
    }

    const uploadedFile = file[0];

    // Validate file type
    if (
      !uploadedFile.originalFilename?.endsWith('.xml') &&
      !ALLOWED_MIME_TYPES.includes(uploadedFile.mimetype || '')
    ) {
      throw new ApiError(400, 'Only XML files are supported for SBOM import');
    }

    console.log(
      `[SBOM Import] Processing file: ${uploadedFile.originalFilename} (${uploadedFile.size} bytes)`
    );

    // Extract file data
    const fileUpload = await extractFileData(uploadedFile);
    const fileDataBase64 = fileUpload.fileData.toString('base64');

    // Create the file import job with file data in payload
    const job = await createFileImportSbomJob(prisma, {
      filename: fileUpload.filename,
      fileData: fileDataBase64,
      mimeType: fileUpload.mimeType,
      triggeredByUserId: teamMember.userId,
      teamId: teamMember.teamId,
      productId: productId as string,
      versionId: versionId as string,
    });

    console.log(
      `[SBOM Import] Job created: ${job.id}, filename: ${fileUpload.filename}, triggeredBy: ${teamMember.userId}`
    );

    res.status(201).json({ data: job, error: null });
  } catch (error: any) {
    console.error('SBOM import error:', error);

    if (error instanceof ApiError) {
      throw error;
    }

    handleFormidableError(error, 100);
  }
};
