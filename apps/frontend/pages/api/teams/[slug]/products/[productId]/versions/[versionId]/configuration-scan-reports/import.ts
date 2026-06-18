import formidable from 'formidable';
import { createConfigurationScanReportWithJob } from '@oscrat/model/operations';
import { ConfigurationScanFormat } from '@oscrat/model';
import { ERROR_CODES } from '@oscrat/model/constants/errorCodes';
import { extractFileData, handleFormidableError } from '@/lib/utils/fileUpload';
import {
  detectConfigurationScanFormat,
  describeConfigurationScanFormat,
  CONFIGURATION_SCAN_FORMAT_KIND,
  type ConfigurationScanFormat as DetectedFormat,
} from '@/lib/utils/configurationScanFormat';
import { prisma } from '@/lib/prisma';
import { withTeamAuth, type AuthenticatedTeamRequest } from '@/lib/middleware';
import type { NextApiResponse } from 'next';
import { ApiError } from '@/lib/errors';

const ALLOWED_MIME_TYPES = ['application/xml', 'text/xml'];
const MAX_CONFIG_SCAN_FILE_SIZE = 100 * 1024 * 1024; // 100MB

const SUPPORTED_ARF_VERSIONS = new Set(['1.1']);
const SUPPORTED_XCCDF_VERSIONS = new Set(['1.2']);

const OVAL_5_VERSION_PATTERN = /^5(\.|$)/;
const isOval5 = (version: string) => OVAL_5_VERSION_PATTERN.test(version);

interface SupportedFormat {
  prismaFormat: ConfigurationScanFormat;
  version: string;
}

const toSupportedFormat = (format: DetectedFormat): SupportedFormat | null => {
  switch (format.kind) {
    case CONFIGURATION_SCAN_FORMAT_KIND.ARF:
      return SUPPORTED_ARF_VERSIONS.has(format.version)
        ? { prismaFormat: ConfigurationScanFormat.ARF, version: format.version }
        : null;
    case CONFIGURATION_SCAN_FORMAT_KIND.XCCDF:
      return SUPPORTED_XCCDF_VERSIONS.has(format.version)
        ? {
            prismaFormat: ConfigurationScanFormat.XCCDF,
            version: format.version,
          }
        : null;
    case CONFIGURATION_SCAN_FORMAT_KIND.OVAL:
      return isOval5(format.version)
        ? {
            prismaFormat: ConfigurationScanFormat.OVAL,
            version: format.version,
          }
        : null;
    case CONFIGURATION_SCAN_FORMAT_KIND.UNKNOWN:
      return null;
  }
};

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

// POST: Create a new file-based configuration scan import report
const handlePOST = async (
  req: AuthenticatedTeamRequest,
  res: NextApiResponse
) => {
  const { teamMember } = req.teamContext;
  const { productId, versionId } = req.query;

  if (!productId || !versionId) {
    throw new ApiError(400, 'Product ID and Version ID are required');
  }

  try {
    const form = formidable({
      maxFileSize: MAX_CONFIG_SCAN_FILE_SIZE,
    });

    const [, files] = await form.parse(req);

    const file = Object.values(files)[0] as formidable.File[];
    if (!file?.[0]) {
      throw new ApiError(400, 'No file uploaded');
    }

    const uploadedFile = file[0];

    if (
      !uploadedFile.originalFilename?.endsWith('.xml') &&
      !ALLOWED_MIME_TYPES.includes(uploadedFile.mimetype || '')
    ) {
      throw new ApiError(
        400,
        'Only XML files are supported for configuration scan import'
      );
    }

    console.log(
      `[Configuration Scan Reports API] Processing file import: ${uploadedFile.originalFilename} (${uploadedFile.size} bytes)`
    );

    const fileUpload = await extractFileData(uploadedFile);

    const head = fileUpload.fileData.subarray(0, 4096).toString('utf-8');
    const format = detectConfigurationScanFormat(head);
    const supported = toSupportedFormat(format);
    if (!supported) {
      const formatLabel = describeConfigurationScanFormat(format);
      throw new ApiError(
        400,
        `Unsupported configuration scan format: ${formatLabel}`,
        {
          code: ERROR_CODES.CONFIGURATION_SCAN_UNSUPPORTED_FORMAT,
          values: { format: formatLabel },
        }
      );
    }

    const report = await createConfigurationScanReportWithJob(
      prisma,
      {
        versionId: versionId as string,
        productId: productId as string,
        format: supported.prismaFormat,
        formatVersion: supported.version,
        fileData: fileUpload.fileData,
        filename: fileUpload.filename,
        mimeType: fileUpload.mimeType,
        triggeredByUserId: teamMember.userId,
        teamId: teamMember.teamId,
      },
      req.auditInfo
    );

    console.log(
      `[Configuration Scan Reports API] File-based report created: reportId: ${report.id}, filename: ${fileUpload.filename}`
    );

    res.status(201).json({ data: report });
  } catch (error: unknown) {
    console.error('[Configuration Scan Reports API] File import error:', error);

    if (error instanceof ApiError) {
      throw error;
    }

    await handleFormidableError(error, 100);
  }
};
