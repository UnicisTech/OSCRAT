import {
  PrismaClient,
  type Prisma,
  OscratProductIncidentStatus,
  OscratProductVersionStatus,
} from '@prisma/client';
import type {
  OscratProductVersionCreate,
  OscratProductVersionUpdate,
  OscratProductVersionSummary,
  OscratProductVersionDetail,
} from '../types/version';
import { OPEN_VULNERABILITY_STATUSES } from '../constants/vulnerability';

/** Include for version summary queries (with counts) */
const VERSION_SUMMARY_INCLUDE = {
  _count: {
    select: {
      incidents: {
        where: { status: OscratProductIncidentStatus.NOT_REPORTED },
      },
      vulnerabilities: {
        where: {
          status: {
            in: OPEN_VULNERABILITY_STATUSES,
          },
        },
      },
      sbomReports: true,
    },
  },
  repository: {
    select: {
      id: true,
    },
  },
};

/** Include for version detail queries */
const VERSION_DETAIL_INCLUDE = {
  incidents: true,
  vulnerabilities: true,
  assessments: true,
  attachments: true,
  repository: {
    select: {
      id: true,
      name: true,
      provider: true,
      repositoryUrl: true,
      targetBranch: true,
      targetTag: true,
      targetCommit: true,
    },
  },
  _count: {
    select: {
      sbomReports: true,
    },
  },
};

/** Type aliases for better maintainability */
type VersionSummaryPayload = Prisma.OscratProductVersionGetPayload<{
  include: typeof VERSION_SUMMARY_INCLUDE;
}>;

type VersionDetailPayload = Prisma.OscratProductVersionGetPayload<{
  include: typeof VERSION_DETAIL_INCLUDE;
}>;

// Transform functions
/** Transform Prisma version to VersionSummary */
export const transformToVersionSummary = (
  version: VersionSummaryPayload
): OscratProductVersionSummary => ({
  id: version.id,
  version: version.version,
  status: version.status,
  productId: version.productId,
  openIncidents: version._count?.incidents || 0,
  openVulnerabilities: version._count?.vulnerabilities || 0,
  hasRepository: !!version.repository,
  sbomReportsCount: version._count?.sbomReports || 0,
  createdAt: version.createdAt,
  updatedAt: version.updatedAt,
  createdBy: version.createdBy,
  updatedBy: version.updatedBy,
});

/** Transform Prisma version to VersionDetail */
export const transformToVersionDetail = (
  version: VersionDetailPayload
): OscratProductVersionDetail => ({
  id: version.id,
  version: version.version,
  status: version.status,
  productId: version.productId,
  incidents:
    version.incidents?.map((incident) => ({
      id: incident.id,
      name: incident.name,
      type: incident.type,
      status: incident.status,
      createdAt: incident.createdAt,
      updatedAt: incident.updatedAt,
      createdBy: incident.createdBy,
      updatedBy: incident.updatedBy,
      ...(incident.incidentReference && {
        incidentReference: incident.incidentReference,
      }),
    })) || [],
  vulnerabilities:
    version.vulnerabilities?.map((vuln) => ({
      id: vuln.id,
      name: vuln.name,
      severity: vuln.severity,
      status: vuln.status,
      versionId: version.id,
      description: vuln.description || '',
      createdAt: vuln.createdAt,
      updatedAt: vuln.updatedAt,
      createdBy: vuln.createdBy,
      updatedBy: vuln.updatedBy,
      ...(vuln.cve && { cve: vuln.cve }),
    })) || [],
  assessments:
    version.assessments?.map((assessment) => ({
      id: assessment.id,
      type: assessment.type,
      schemaVersion: assessment.schemaVersion,
      versionId: assessment.versionId,
      productId: assessment.productId,
      createdAt: assessment.createdAt,
      createdBy: assessment.createdBy,
    })) || [],
  repository: version.repository
    ? {
        id: version.repository.id,
        name: version.repository.name,
        provider: version.repository.provider,
        repositoryUrl: version.repository.repositoryUrl,
        targetBranch: version.repository.targetBranch || undefined,
        targetTag: version.repository.targetTag || undefined,
        targetCommit: version.repository.targetCommit || undefined,
      }
    : undefined,
  sbomReportsCount: version._count?.sbomReports || 0,
  createdAt: version.createdAt,
  updatedAt: version.updatedAt,
  createdBy: version.createdBy,
  updatedBy: version.updatedBy,
});

// Query functions
/** Get all versions for a specific product */
export const getVersions = async (
  prisma: PrismaClient,
  teamId: string,
  productId: string
): Promise<OscratProductVersionSummary[]> => {
  const versions = await prisma.oscratProductVersion.findMany({
    where: {
      productId: productId,
      teamId: teamId,
    },
    include: VERSION_SUMMARY_INCLUDE,
    orderBy: { createdAt: 'desc' },
  });

  return versions.map(transformToVersionSummary);
};

/** Get detailed information for a specific version */
export const getVersionDetail = async (
  prisma: PrismaClient,
  teamId: string,
  versionId: string
): Promise<OscratProductVersionDetail | null> => {
  const version = await prisma.oscratProductVersion.findFirst({
    where: {
      id: versionId,
      teamId: teamId,
    },
    include: VERSION_DETAIL_INCLUDE,
  });

  return version ? transformToVersionDetail(version) : null;
};

/** Create a new version for a product */
export const createVersion = async (
  prisma: PrismaClient,
  teamId: string,
  data: OscratProductVersionCreate
): Promise<OscratProductVersionDetail> => {
  // Create the version - product ownership is implicit through teamId
  const version = await prisma.oscratProductVersion.create({
    data: {
      version: data.version,
      status: data.status || OscratProductVersionStatus.DRAFT,
      productId: data.productId,
      teamId: teamId,
      createdBy: data.createdBy,
      updatedBy: data.createdBy,
    },
    include: VERSION_DETAIL_INCLUDE,
  });

  return transformToVersionDetail(version);
};

// Mutation functions
/** Update an existing version */
export const updateVersion = async (
  prisma: PrismaClient,
  teamId: string,
  versionId: string,
  data: OscratProductVersionUpdate
): Promise<OscratProductVersionDetail> => {
  // Update the version with team ownership check
  const version = await prisma.oscratProductVersion.update({
    where: {
      id: versionId,
      teamId: teamId,
    },
    data: {
      version: data.version,
      status: data.status,
      updatedBy: data.updatedBy,
    },
    include: VERSION_DETAIL_INCLUDE,
  });

  return transformToVersionDetail(version);
};

/** Delete a version */
export const deleteVersion = async (
  prisma: PrismaClient,
  teamId: string,
  versionId: string
): Promise<void> => {
  // Delete the version with team ownership check
  await prisma.oscratProductVersion.delete({
    where: {
      id: versionId,
      teamId: teamId,
    },
  });
};
