import {
  PrismaClient,
  type Prisma,
  OscratProductVersionStatus,
} from '@prisma/client';
import type {
  OscratProductVersionCreate,
  OscratProductVersionUpdate,
  OscratProductVersionSummary,
  OscratProductVersionDetail,
} from '../types/version';
import { OPEN_VULNERABILITY_STATUSES } from '../constants/vulnerability';
import { OPEN_INCIDENT_STATUSES } from '../types/incidents';

const VERSION_SUMMARY_INCLUDE = {
  _count: {
    select: {
      incidents: {
        where: {
          status: {
            in: OPEN_INCIDENT_STATUSES,
          },
        },
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

const VERSION_DETAIL_INCLUDE = {
  incidents: {
    include: {
      reporter: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  },
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

type VersionSummaryPayload = Prisma.OscratProductVersionGetPayload<{
  include: typeof VERSION_SUMMARY_INCLUDE;
}>;

type VersionDetailPayload = Prisma.OscratProductVersionGetPayload<{
  include: typeof VERSION_DETAIL_INCLUDE;
}>;

export const transformToVersionSummary = (
  version: VersionSummaryPayload
): OscratProductVersionSummary => ({
  id: version.id,
  version: version.version,
  status: version.status,
  supportEndDate: version.supportEndDate || undefined,
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

export const transformToVersionDetail = (
  version: VersionDetailPayload
): OscratProductVersionDetail => ({
  id: version.id,
  version: version.version,
  status: version.status,
  supportEndDate: version.supportEndDate || undefined,
  productId: version.productId,
  incidents:
    version.incidents?.map((incident) => ({
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
    })) || [],
  vulnerabilities:
    version.vulnerabilities?.map((vuln) => ({
      id: vuln.id,
      name: vuln.name,
      description: vuln.description,
      severity: vuln.severity,
      status: vuln.status,
      cve: vuln.cve ?? undefined,
      advisoryId: vuln.advisoryId ?? undefined,
      dateOfDiscovery: vuln.dateOfDiscovery,
      affectedMemberStates: vuln.affectedMemberStates,
      versionId: version.id,
      createdAt: vuln.createdAt,
      updatedAt: vuln.updatedAt,
      createdBy: vuln.createdBy,
      updatedBy: vuln.updatedBy,
    })) || [],
  assessments:
    version.assessments?.map((assessment) => ({
      id: assessment.id,
      type: assessment.type,
      schemaVersion: assessment.schemaVersion,
      teamId: assessment.teamId,
      versionId: assessment.versionId ?? undefined,
      productId: assessment.productId ?? undefined,
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

export const createVersion = async (
  prisma: PrismaClient,
  teamId: string,
  data: OscratProductVersionCreate
): Promise<OscratProductVersionDetail> => {
  const version = await prisma.oscratProductVersion.create({
    data: {
      version: data.version,
      status: data.status || OscratProductVersionStatus.DRAFT,
      supportEndDate: data.supportEndDate,
      productId: data.productId,
      teamId: teamId,
      createdBy: data.createdBy,
      updatedBy: data.createdBy,
    },
    include: VERSION_DETAIL_INCLUDE,
  });

  return transformToVersionDetail(version);
};

export const updateVersion = async (
  prisma: PrismaClient,
  teamId: string,
  versionId: string,
  data: OscratProductVersionUpdate
): Promise<OscratProductVersionDetail> => {
  const version = await prisma.oscratProductVersion.update({
    where: {
      id: versionId,
      teamId: teamId,
    },
    data: {
      version: data.version,
      status: data.status,
      supportEndDate: data.supportEndDate,
      updatedBy: data.updatedBy,
    },
    include: VERSION_DETAIL_INCLUDE,
  });

  return transformToVersionDetail(version);
};

export const deleteVersion = async (
  prisma: PrismaClient,
  teamId: string,
  versionId: string
): Promise<void> => {
  await prisma.oscratProductVersion.delete({
    where: {
      id: versionId,
      teamId: teamId,
    },
  });
};
