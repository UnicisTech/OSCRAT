import {
  getOrganizationSummary,
  getOrganizationDetail,
  createOrganization,
  updateOrganization,
} from 'models/oscrat';
import { withAuth, type AuthenticatedRequest } from '@/lib/middleware';
import type { NextApiResponse } from 'next';
import { ApiError } from '@/lib/errors';

export default function handler(
  req: AuthenticatedRequest,
  res: NextApiResponse
) {
  const { method } = req;

  switch (method) {
    case 'GET':
      return withAuth(['team', 'read'])(handleGET)(req, res);
    case 'POST':
      return withAuth(['team', 'create'])(handlePOST)(req, res);
    case 'PUT':
      return withAuth(['team', 'update'])(handlePUT)(req, res);
    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT']);
      throw new ApiError(405, `Method ${method} Not Allowed`);
  }
}

// Get organization summary or detail
const handleGET = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  const { teamMember } = req.teamContext;

  const { detail } = req.query;

  let organization;
  if (detail === 'true') {
    organization = await getOrganizationDetail(teamMember.teamId);
  } else {
    organization = await getOrganizationSummary(teamMember.teamId);
  }

  res.status(200).json({ data: organization });
};

// Create organization
const handlePOST = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  const { teamMember } = req.teamContext;

  const organizationData = req.body;

  const organization = await createOrganization(
    teamMember.teamId,
    organizationData
  );

  console.log(`[OSCRAT] organization created, orgId: ${organization.id}, teamId: ${teamMember.teamId}`);

  res.status(201).json({ data: organization });
};

// Update organization
const handlePUT = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  const { teamMember } = req.teamContext;

  const organizationData = req.body;

  const organization = await updateOrganization(
    teamMember.teamId,
    organizationData
  );

  console.log(`[OSCRAT] organization updated, orgId: ${organization.id}, teamId: ${teamMember.teamId}`);

  res.status(200).json({ data: organization });
};
