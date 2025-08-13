import { prisma } from '@/lib/prisma';
import {
  OscratProductIncidentStatus,
  OscratProductVulnerabilityStatus,
  type Prisma,
} from '@oscrat/model';
import type {
  OscratProductVersionCreate,
  OscratProductVersionUpdate,
  OscratProductVersionSummary,
  OscratProductVersionDetail,
} from '@oscrat/model';
import { transformToVersionSummary, transformToVersionDetail } from './shared';

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
            in: [
              OscratProductVulnerabilityStatus.OPEN,
              OscratProductVulnerabilityStatus.ACTIVELY_EXPLOITED,
            ] as OscratProductVulnerabilityStatus[],
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
} as const;

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
} as const;

/** Get all versions for a specific product */
export const getVersions = async (
  teamId: string,
  productId: string
): Promise<OscratProductVersionSummary[]> => {
  // Verify product ownership first
  const team = await prisma.team.findUnique({
    where: { id: teamId },
    include: {
      products: {
        where: { id: productId },
        include: {
          versions: {
            include: VERSION_SUMMARY_INCLUDE,
            orderBy: { createdAt: 'desc' },
          },
        },
      },
    },
  });

  if (!team || team.products.length === 0) {
    throw new Error(`Product ${productId} not found for team: ${teamId}`);
  }

  const product = team.products[0];
  return product.versions.map(transformToVersionSummary);
};

/** Get detailed information for a specific version */
export const getVersionDetail = async (
  teamId: string,
  versionId: string
): Promise<OscratProductVersionDetail | null> => {
  // First verify that the version belongs to a product owned by the team
  const team = await prisma.team.findUnique({
    where: { id: teamId },
    include: {
      products: {
        include: {
          versions: {
            where: { id: versionId },
            include: VERSION_DETAIL_INCLUDE,
          },
        },
      },
    },
  });

  if (!team) {
    throw new Error(`No team found: ${teamId}`);
  }

  // Find the version across all products
  const version = team.products
    .flatMap((product) => product.versions)
    .find((v) => v.id === versionId);

  return version ? transformToVersionDetail(version) : null;
};

/** Create a new version for a product */
export const createVersion = async (
  teamId: string,
  data: OscratProductVersionCreate
): Promise<OscratProductVersionDetail> => {
  // Verify product ownership first
  const team = await prisma.team.findUnique({
    where: { id: teamId },
    include: {
      products: {
        where: { id: data.productId },
        select: { id: true },
      },
    },
  });

  if (!team || team.products.length === 0) {
    throw new Error(`Product ${data.productId} not found for team: ${teamId}`);
  }

  // Create the version
  const version = await prisma.oscratProductVersion.create({
    data: {
      version: data.version,
      status: data.status || 'DRAFT',
      productId: data.productId,
      createdBy: data.createdBy,
      updatedBy: data.createdBy,
    },
    include: VERSION_DETAIL_INCLUDE,
  });

  return transformToVersionDetail(version);
};

/** Update an existing version */
export const updateVersion = async (
  teamId: string,
  versionId: string,
  data: OscratProductVersionUpdate
): Promise<OscratProductVersionDetail> => {
  // First verify that the version belongs to a product owned by the team
  const team = await prisma.team.findUnique({
    where: { id: teamId },
    include: {
      products: {
        include: {
          versions: {
            where: { id: versionId },
            select: { id: true },
          },
        },
      },
    },
  });

  if (!team) {
    throw new Error(`No team found: ${teamId}`);
  }

  // Check if version exists and belongs to team
  const versionExists = team.products.some((product) =>
    product.versions.some((v) => v.id === versionId)
  );

  if (!versionExists) {
    throw new Error(`Version ${versionId} not found for team: ${teamId}`);
  }

  // Update the version
  const version = await prisma.oscratProductVersion.update({
    where: { id: versionId },
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
  teamId: string,
  versionId: string
): Promise<void> => {
  // First verify that the version belongs to a product owned by the team
  const team = await prisma.team.findUnique({
    where: { id: teamId },
    include: {
      products: {
        include: {
          versions: {
            where: { id: versionId },
            select: { id: true },
          },
        },
      },
    },
  });

  if (!team) {
    throw new Error(`No team found: ${teamId}`);
  }

  // Check if version exists and belongs to team
  const versionExists = team.products.some((product) =>
    product.versions.some((v) => v.id === versionId)
  );

  if (!versionExists) {
    throw new Error(`Version ${versionId} not found for team: ${teamId}`);
  }

  // Delete the version
  await prisma.oscratProductVersion.delete({
    where: { id: versionId },
  });
};
