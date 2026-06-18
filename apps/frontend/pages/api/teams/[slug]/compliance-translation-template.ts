import type { NextApiResponse } from 'next';
import { withTeamAuth, type AuthenticatedTeamRequest } from '@/lib/middleware';
import { ApiError } from '@/lib/errors';
import { COMPLIANCE_TEMPLATE_FILES } from '@/constants/complianceTemplates';
import fs from 'fs';
import path from 'path';

export default function handler(
  req: AuthenticatedTeamRequest,
  res: NextApiResponse
) {
  const { method } = req;
  if (method !== 'GET') {
    res.setHeader('Allow', 'GET');
    throw new ApiError(405, `Method ${method} Not Allowed`);
  }
  return withTeamAuth(['team', 'read'])(handleGET)(req, res);
}

const handleGET = async (
  req: AuthenticatedTeamRequest,
  res: NextApiResponse
) => {
  const { namespace } = req.query as { namespace: string };

  const templateFile = COMPLIANCE_TEMPLATE_FILES[namespace];
  if (!templateFile) {
    throw new ApiError(400, 'Invalid namespace');
  }

  const filePath = path.join(process.cwd(), 'locales', 'en', templateFile);
  if (!fs.existsSync(filePath)) {
    throw new ApiError(404, 'Template not found');
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  const parsed = JSON.parse(content);
  res.status(200).json({ data: parsed });
};
