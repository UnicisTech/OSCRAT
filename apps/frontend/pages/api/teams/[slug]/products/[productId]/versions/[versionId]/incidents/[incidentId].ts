import { prisma } from '@/lib/prisma';
import {
  getIncidentDetail,
  updateIncident,
  deleteIncident,
} from '@oscrat/model/operations';
import { withTeamAuth, type AuthenticatedTeamRequest } from '@/lib/middleware';
import type { NextApiResponse } from 'next';
import type { OscratIncidentUpdate } from '@oscrat/model';

export default function handler(
  req: AuthenticatedTeamRequest,
  res: NextApiResponse
) {
  const { method } = req;

  switch (method) {
    case 'GET':
      return withTeamAuth(['team', 'read'])(handleGET)(req, res);
    case 'PUT':
      return withTeamAuth(['team', 'update'])(handlePUT)(req, res);
    case 'DELETE':
      return withTeamAuth(['team', 'delete'])(handleDELETE)(req, res);
    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      res.status(405).json({
        error: { message: `Method ${method} Not Allowed` },
      });
  }
}

// Get incident detail
const handleGET = async (
  req: AuthenticatedTeamRequest,
  res: NextApiResponse
) => {
  const { teamMember } = req.teamContext;

  const { incidentId } = req.query;

  const incident = await getIncidentDetail(
    prisma,
    teamMember.teamId,
    incidentId as string
  );

  if (!incident) {
    return res.status(404).json({
      error: { message: 'Incident not found' },
    });
  }

  res.status(200).json({ data: incident });
};

// Update incident
const handlePUT = async (
  req: AuthenticatedTeamRequest,
  res: NextApiResponse
) => {
  const { teamMember } = req.teamContext;

  const { versionId, incidentId } = req.query;
  const incidentData = req.body as OscratIncidentUpdate;

  // Add updatedBy field from the authenticated user
  const updateData: OscratIncidentUpdate = {
    ...incidentData,
    updatedBy: teamMember.userId,
  };

  const incident = await updateIncident(
    prisma,
    teamMember.teamId,
    versionId as string,
    incidentId as string,
    updateData,
    req.auditInfo
  );

  res.status(200).json({ data: incident });
};

// Delete incident
const handleDELETE = async (
  req: AuthenticatedTeamRequest,
  res: NextApiResponse
) => {
  const { teamMember } = req.teamContext;

  const { incidentId } = req.query;

  await deleteIncident(
    prisma,
    teamMember.teamId,
    incidentId as string,
    req.auditInfo
  );

  res.status(200).json({ data: {} });
};
