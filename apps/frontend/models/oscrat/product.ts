import { prisma } from '@/lib/prisma';
import {
  type Prisma,
  OscratProductVulnerabilityStatus,
  OscratProductIncidentStatus,
} from '@oscrat/model';
import type {
  OscratProductCreate,
  OscratProductUpdate,
  OscratProductSummary,
  OscratProductDetail,
} from '@oscrat/model';
import { transformToProductSummary, transformToProductDetail } from './shared';

/** Include for project summary queries (with product counts) */
const PROJECT_SUMMARY_INCLUDE = {
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

/** Include for project detail queries */
const PROJECT_DETAIL_INCLUDE = {
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
};

/** Get all products for a team */
export const getProducts = async (
  teamId: string
): Promise<OscratProductSummary[]> => {
  const team = await prisma.team.findUnique({
    where: { id: teamId },
    include: PROJECT_SUMMARY_INCLUDE,
  });

  return team?.products.map(transformToProductSummary) || [];
};

/** Get detailed information for a specific product */
export const getProductDetail = async (
  teamId: string,
  productId: string
): Promise<OscratProductDetail | null> => {
  const team = await prisma.team.findUnique({
    where: { id: teamId },
    include: {
      products: {
        where: { id: productId },
        include: PROJECT_DETAIL_INCLUDE,
      },
    },
  });

  const product = team?.products?.[0];
  return product ? transformToProductDetail(product) : null;
};

/** Create a new product for the team */
export const createProduct = async (
  teamId: string,
  data: OscratProductCreate
): Promise<OscratProductDetail> => {
  // Create the project directly linked to the team
  const product = await prisma.oscratProduct.create({
    data: {
      name: data.name,
      description: data.description,
      type: data.type,
      productCategory: data.productCategory,
      teamId: teamId,
      createdBy: data.createdBy,
      updatedBy: data.createdBy,
    },
    include: PROJECT_DETAIL_INCLUDE,
  });

  return transformToProductDetail(product);
};

/** Update an existing project */
export const updateProduct = async (
  teamId: string,
  projectId: string,
  data: Partial<OscratProductUpdate>
): Promise<OscratProductDetail> => {
  // Verify project ownership first
  const team = await prisma.team.findUnique({
    where: { id: teamId },
    include: {
      products: {
        where: { id: projectId },
        select: { id: true }, // Only need to verify existence
      },
    },
  });

  if (!team || team.products.length === 0) {
    throw new Error(`Project ${projectId} not found for team: ${teamId}`);
  }

  // Update the project
  const product = await prisma.oscratProduct.update({
    where: { id: projectId },
    data: {
      name: data.name,
      description: data.description,
      type: data.type,
      productCategory: data.productCategory,
      updatedBy: data.updatedBy,
    },
    include: PROJECT_DETAIL_INCLUDE,
  });

  return transformToProductDetail(product);
};

/** Delete a project */
export const deleteProduct = async (
  teamId: string,
  projectId: string
): Promise<void> => {
  // Verify project ownership first
  const team = await prisma.team.findUnique({
    where: { id: teamId },
    include: {
      products: {
        where: { id: projectId },
        select: { id: true }, // Only need to verify existence
      },
    },
  });

  if (!team || team.products.length === 0) {
    throw new Error(`Project ${projectId} not found for team: ${teamId}`);
  }

  // Delete the project
  await prisma.oscratProduct.delete({
    where: { id: projectId },
  });
};
