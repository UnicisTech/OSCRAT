import { prisma } from '@/lib/prisma';
import {
  type Prisma,
  OscratProductVulnerabilityStatus,
  OscratProductIncidentStatus,
} from '@oscrat/model';
import type {
  OscratOrganizationCreate,
  OscratOrganizationUpdate,
  OscratOrganizationSummary,
  OscratOrganizationDetail,
} from '@oscrat/model';
import { transformToProductSummary, transformToProductDetail } from './shared';

/** Include for organization summary queries (with product counts) */
const ORGANIZATION_SUMMARY_INCLUDE = {
  products: {
    include: {
      reportingOrganizations: true,
      _count: {
        select: {
          versions: true,
        },
      },
      versions: {
        select: {
          id: true,
          status: true,
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
                    ],
                  },
                },
              },
            },
          },
        },
      },
    },
  },
};

/** Include for organization detail queries (with full product relations) */
const ORGANIZATION_DETAIL_INCLUDE = {
  products: {
    include: {
      reportingOrganizations: true,
      versions: {
        include: {
          repository: {
            select: {
              id: true,
            },
          },
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
                    ],
                  },
                },
              },
              sbomReports: true,
            },
          },
        },
      },
    },
  },
};

/** Transform Prisma organization to OrganizationSummary */
const transformToOrganizationSummary = (
  organization: Prisma.OscratOrganizationGetPayload<{
    include: typeof ORGANIZATION_SUMMARY_INCLUDE;
  }>
): OscratOrganizationSummary => ({
  id: organization.id,
  name: organization.name,
  type: organization.type,
  size: organization.size,
  roles: organization.roles,
  createdAt: organization.createdAt,
  updatedAt: organization.updatedAt,
  createdBy: organization.createdBy,
  updatedBy: organization.updatedBy,
  products: organization.products.map(transformToProductSummary),
});

/** Transform Prisma organization to OrganizationDetail */
const transformToOrganizationDetail = (
  organization: Prisma.OscratOrganizationGetPayload<{
    include: typeof ORGANIZATION_DETAIL_INCLUDE;
  }>
): OscratOrganizationDetail => ({
  id: organization.id,
  name: organization.name,
  type: organization.type,
  size: organization.size,
  roles: organization.roles,
  createdAt: organization.createdAt,
  updatedAt: organization.updatedAt,
  createdBy: organization.createdBy,
  updatedBy: organization.updatedBy,
  products: organization.products.map(transformToProductDetail),
});

/** Get organization summary with product counts */
export const getOrganizationSummary = async (
  teamId: string
): Promise<OscratOrganizationSummary | null> => {
  const organization = await prisma.oscratOrganization.findFirst({
    where: { teamId },
    include: ORGANIZATION_SUMMARY_INCLUDE,
  });

  return organization ? transformToOrganizationSummary(organization) : null;
};

/** Get organization detail with full product relations */
export const getOrganizationDetail = async (
  teamId: string
): Promise<OscratOrganizationDetail | null> => {
  const organization = await prisma.oscratOrganization.findFirst({
    where: { teamId },
    include: ORGANIZATION_DETAIL_INCLUDE,
  });

  return organization ? transformToOrganizationDetail(organization) : null;
};

/** Create a new organization for the team */
export const createOrganization = async (
  teamId: string,
  data: OscratOrganizationCreate
): Promise<OscratOrganizationDetail> => {
  const organization = await prisma.oscratOrganization.create({
    data: {
      name: data.name,
      type: data.type,
      size: data.size,
      roles: data.roles,
      teamId,
      createdBy: data.createdBy,
      updatedBy: data.createdBy, // Initially same as createdBy
    },
    include: ORGANIZATION_DETAIL_INCLUDE,
  });

  return transformToOrganizationDetail(organization);
};

/** Update organization details */
export const updateOrganization = async (
  teamId: string,
  data: OscratOrganizationUpdate
): Promise<OscratOrganizationDetail> => {
  const organization = await prisma.oscratOrganization.update({
    where: { teamId },
    data: {
      name: data.name,
      type: data.type,
      size: data.size,
      roles: data.roles,
      updatedBy: data.updatedBy,
    },
    include: ORGANIZATION_DETAIL_INCLUDE,
  });

  return transformToOrganizationDetail(organization);
};
