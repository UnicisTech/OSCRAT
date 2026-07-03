import { prisma } from '@/lib/prisma';
import {
  getVulnerabilities,
  createVulnerability,
} from '@oscrat/model/operations';
import { withTeamAuth, type AuthenticatedTeamRequest } from '@/lib/middleware';
import type { NextApiResponse } from 'next';
import type { OscratVulnerabilityCreate } from '@oscrat/model';
import { parseBody } from '@/lib/validation/validateRequest';
import { vulnerabilityCreateSchema } from '@/lib/validation/vulnerability';

export default function handler(
  req: AuthenticatedTeamRequest,
  res: NextApiResponse
) {
  const { method } = req;

  switch (method) {
    case 'GET':
      return withTeamAuth(['team', 'read'])(handleGET)(req, res);
    case 'POST':
      return withTeamAuth(['team', 'create'])(handlePOST)(req, res);
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).json({
        error: { message: `Method ${method} Not Allowed` },
      });
  }
}

const handleGET = async (
  req: AuthenticatedTeamRequest,
  res: NextApiResponse
) => {
  const { teamMember } = req.teamContext;

  const { versionId } = req.query;

  const result = await getVulnerabilities(
    prisma,
    teamMember.teamId,
    versionId as string
  );

  res.status(200).json({ data: result });
};

const handlePOST = async (
  req: AuthenticatedTeamRequest,
  res: NextApiResponse
) => {
  const { teamMember } = req.teamContext;

  const { productId, versionId } = req.query;

  const vulnerabilityData = await parseBody(vulnerabilityCreateSchema, req);

  const createData: OscratVulnerabilityCreate = {
    ...vulnerabilityData,
    createdBy: teamMember.userId,
  };

  const vulnerability = await createVulnerability(
    prisma,
    teamMember.teamId,
    productId as string,
    versionId as string,
    createData,
    req.auditInfo
  );

  res.status(201).json({ data: vulnerability });
};
