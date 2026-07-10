import { prisma } from '@/lib/prisma';
import {
  getIncidents,
  createIncident,
  INCIDENT_NAME_CONFLICT,
} from '@oscrat/model/operations';
import { withTeamAuth, type AuthenticatedTeamRequest } from '@/lib/middleware';
import type { NextApiResponse } from 'next';
import type { OscratIncidentCreate } from '@oscrat/model';
import { parseBody } from '@/lib/validation/validateRequest';
import { incidentCreateSchema } from '@/lib/validation/incident';
import { ApiError, isPrismaUniqueConstraintError } from '@/lib/errors';

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

// Get all incidents for a version
const handleGET = async (
  req: AuthenticatedTeamRequest,
  res: NextApiResponse
) => {
  const { teamMember } = req.teamContext;

  const { versionId } = req.query;

  const result = await getIncidents(
    prisma,
    teamMember.teamId,
    versionId as string
  );

  res.status(200).json({ data: result });
};

// Create incident for a version
const handlePOST = async (
  req: AuthenticatedTeamRequest,
  res: NextApiResponse
) => {
  const { teamMember } = req.teamContext;

  const { productId, versionId } = req.query;

  const incidentData = await parseBody(incidentCreateSchema, req);

  const createData: OscratIncidentCreate = {
    ...incidentData,
    createdBy: teamMember.userId,
  };

  let incident: Awaited<ReturnType<typeof createIncident>>;
  try {
    incident = await createIncident(
      prisma,
      teamMember.teamId,
      productId as string,
      versionId as string,
      createData,
      req.auditInfo
    );
  } catch (error) {
    if (
      (error instanceof Error && error.message === INCIDENT_NAME_CONFLICT) ||
      isPrismaUniqueConstraintError(error)
    ) {
      throw new ApiError(409, INCIDENT_NAME_CONFLICT);
    }
    throw error;
  }

  res.status(201).json({ data: incident });
};
