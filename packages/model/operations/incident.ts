import { PrismaClient, type Prisma } from '@prisma/client';
import type {
  OscratIncidentCreate,
  OscratIncidentUpdate,
  OscratIncidentSummary,
  OscratIncidentDetail,
} from '../types/incidents';

const USER_SELECT = {
  id: true,
  name: true,
  email: true,
};

const INCIDENT_SUMMARY_INCLUDE = {
  reporter: {
    select: USER_SELECT,
  },
};

const INCIDENT_DETAIL_INCLUDE = {
  ...INCIDENT_SUMMARY_INCLUDE,
  createdByUser: {
    select: USER_SELECT,
  },
  updatedByUser: {
    select: USER_SELECT,
  },
  attachments: true,
};

type IncidentSummaryPayload = Prisma.OscratProductIncidentGetPayload<{
  include: typeof INCIDENT_SUMMARY_INCLUDE;
}>;

type IncidentDetailPayload = Prisma.OscratProductIncidentGetPayload<{
  include: typeof INCIDENT_DETAIL_INCLUDE;
}>;

/**
 * Validates that attachments exist, belong to the correct version,
 * and are not already linked to other incidents
 */
const validateAttachmentsForIncident = async (
  prisma: PrismaClient,
  attachmentIds: string[],
  versionId: string,
  existingIncidentId?: string
): Promise<void> => {
  if (attachmentIds.length === 0) return;

  const attachments = await prisma.attachment.findMany({
    where: {
      id: { in: attachmentIds },
    },
    select: {
      id: true,
      versionId: true,
      incidentId: true,
    },
  });

  if (attachments.length !== attachmentIds.length) {
    throw new Error('One or more attachments not found');
  }

  // Validate all attachments belong to the same version
  const invalidAttachments = attachments.filter(
    (att) => att.versionId !== versionId
  );
  if (invalidAttachments.length > 0) {
    throw new Error('All attachments must belong to the same version as the incident');
  }

  // Validate attachments are not already linked to another incident
  const alreadyLinked = attachments.filter((att) =>
    existingIncidentId
      ? att.incidentId !== null && att.incidentId !== existingIncidentId
      : att.incidentId !== null
  );
  if (alreadyLinked.length > 0) {
    throw new Error('One or more attachments are already linked to another incident');
  }
};

export const transformToIncidentSummary = (
  incident: IncidentSummaryPayload
): OscratIncidentSummary => ({
  id: incident.id,
  status: incident.status,
  classification: incident.classification,
  attackType: incident.attackType,
  severity: incident.severity,
  dateOfDetection: incident.dateOfDetection,
  description: incident.description,
  scope: incident.scope,
  reporter: {
    id: incident.reporter.id,
    name: incident.reporter.name,
    email: incident.reporter.email,
  },
  createdAt: incident.createdAt,
  updatedAt: incident.updatedAt,
  createdBy: incident.createdBy,
  updatedBy: incident.updatedBy,
});


export const transformToIncidentDetail = (
  incident: IncidentDetailPayload
): OscratIncidentDetail => ({
  id: incident.id,
  status: incident.status,
  classification: incident.classification,
  attackType: incident.attackType,
  assetDetails: incident.assetDetails || undefined,
  severity: incident.severity,
  dateOfDetection: incident.dateOfDetection,
  handlingDate: incident.handlingDate || undefined,
  description: incident.description,
  correctiveActions: incident.correctiveActions || undefined,
  rootCause: incident.rootCause || undefined,
  scope: incident.scope,
  preventiveActions: incident.preventiveActions || undefined,
  suspectedUnlawfulAct: incident.suspectedUnlawfulAct,
  unlawfulActDescription: incident.unlawfulActDescription || undefined,
  crossBorderImpact: incident.crossBorderImpact,
  crossBorderImpactDetails: incident.crossBorderImpactDetails || undefined,
  reporter: {
    id: incident.reporter.id,
    name: incident.reporter.name,
    email: incident.reporter.email,
  },
  createdByUser: {
    id: incident.createdByUser.id,
    name: incident.createdByUser.name,
    email: incident.createdByUser.email,
  },
  updatedByUser: {
    id: incident.updatedByUser.id,
    name: incident.updatedByUser.name,
    email: incident.updatedByUser.email,
  },
  attachments: incident.attachments || [],
  createdAt: incident.createdAt,
  updatedAt: incident.updatedAt,
  createdBy: incident.createdBy,
  updatedBy: incident.updatedBy,
});

export const getIncidents = async (
  prisma: PrismaClient,
  teamId: string,
  versionId: string
): Promise<OscratIncidentSummary[]> => {
  const incidents = await prisma.oscratProductIncident.findMany({
    where: {
      teamId: teamId,
      versionId: versionId,
    },
    include: INCIDENT_SUMMARY_INCLUDE,
    orderBy: { dateOfDetection: 'desc' },
  });

  return incidents.map(transformToIncidentSummary);
};

export const getIncidentDetail = async (
  prisma: PrismaClient,
  teamId: string,
  incidentId: string
): Promise<OscratIncidentDetail | null> => {
  const incident = await prisma.oscratProductIncident.findFirst({
    where: {
      id: incidentId,
      teamId: teamId,
    },
    include: INCIDENT_DETAIL_INCLUDE,
  });

  return incident ? transformToIncidentDetail(incident) : null;
};

export const createIncident = async (
  prisma: PrismaClient,
  teamId: string,
  productId: string,
  versionId: string,
  data: OscratIncidentCreate
): Promise<OscratIncidentDetail> => {
  // Validate attachments if provided
  if (data.attachmentIds) {
    await validateAttachmentsForIncident(
      prisma,
      data.attachmentIds,
      versionId
    );
  }

  // Create incident and link attachments in a transaction
  const incident = await prisma.$transaction(async (tx) => {
    // Destructure attachmentIds out of data since it's not a Prisma field
    const { attachmentIds, ...createData } = data;

    const newIncident = await tx.oscratProductIncident.create({
      data: {
        ...createData,
        suspectedUnlawfulAct: createData.suspectedUnlawfulAct ?? false,
        crossBorderImpact: createData.crossBorderImpact ?? false,
        versionId: versionId,
        productId: productId,
        teamId: teamId,
        updatedBy: createData.createdBy,
      },
    });

    // Link attachments if provided
    if (attachmentIds && attachmentIds.length > 0) {
      await tx.attachment.updateMany({
        where: {
          id: { in: attachmentIds },
        },
        data: {
          incidentId: newIncident.id,
        },
      });
    }

    // Fetch incident with all relations
    return tx.oscratProductIncident.findUnique({
      where: { id: newIncident.id },
      include: INCIDENT_DETAIL_INCLUDE,
    });
  });

  return transformToIncidentDetail(incident!);
};

export const updateIncident = async (
  prisma: PrismaClient,
  teamId: string,
  versionId: string,
  incidentId: string,
  data: OscratIncidentUpdate
): Promise<OscratIncidentDetail> => {
  // Validate attachments if provided
  if (data.attachmentIds) {
    await validateAttachmentsForIncident(
      prisma,
      data.attachmentIds,
      versionId,
      incidentId
    );
  }

  // Update incident and manage attachments in a transaction
  const incident = await prisma.$transaction(async (tx) => {
    // Destructure attachmentIds out of data since it's not a Prisma field
    const { attachmentIds, ...updateData } = data;

    // Update incident data
    await tx.oscratProductIncident.update({
      where: {
        id: incidentId,
        teamId: teamId,
      },
      data: updateData,
    });

    // Handle attachment updates if provided
    if (attachmentIds !== undefined) {
      // First, unlink all current attachments
      await tx.attachment.updateMany({
        where: {
          incidentId: incidentId,
        },
        data: {
          incidentId: null,
        },
      });

      // Then link new attachments if any
      if (attachmentIds.length > 0) {
        await tx.attachment.updateMany({
          where: {
            id: { in: attachmentIds },
          },
          data: {
            incidentId: incidentId,
          },
        });
      }
    }

    // Fetch incident with all relations
    return tx.oscratProductIncident.findUnique({
      where: { id: incidentId },
      include: INCIDENT_DETAIL_INCLUDE,
    });
  });

  return transformToIncidentDetail(incident!);
};

export const deleteIncident = async (
  prisma: PrismaClient,
  teamId: string,
  incidentId: string
): Promise<void> => {
  await prisma.oscratProductIncident.delete({
    where: {
      id: incidentId,
      teamId: teamId,
    },
  });
};
