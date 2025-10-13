import {
  PrismaClient,
  type Prisma,
  OscratProductIncidentStatus,
  OscratProductVersionStatus,
} from '@prisma/client';
import type {
  OscratProductCreate,
  OscratProductUpdate,
  OscratProductSummary,
  OscratProductDetail,
} from '../types/product';
import { OPEN_VULNERABILITY_STATUSES } from '../constants/vulnerability';

/** Include for product summary queries (lightweight with counts) */
const PRODUCT_SUMMARY_INCLUDE = {
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
                in: OPEN_VULNERABILITY_STATUSES,
              },
            },
          },
        },
      },
    },
  },
};

/** Include for product detail queries */
const PRODUCT_DETAIL_INCLUDE = {
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
                in: OPEN_VULNERABILITY_STATUSES,
              },
            },
          },
          sbomReports: true,
        },
      },
    },
  },
};

/** Type aliases for better maintainability */
type ProductSummaryPayload = Prisma.OscratProductGetPayload<{
  include: typeof PRODUCT_SUMMARY_INCLUDE;
}>;

type ProductDetailPayload = Prisma.OscratProductGetPayload<{
  include: typeof PRODUCT_DETAIL_INCLUDE;
}>;

// Transform functions
/** Transform Prisma product to ProductSummary (lightweight with counts) */
export const transformToProductSummary = (
  product: ProductSummaryPayload
): OscratProductSummary => {
  const versions = product.versions || [];

  const activeVersionsCount = versions.filter(
    (version) => version.status === OscratProductVersionStatus.ACTIVE
  ).length;

  const totalOpenIncidents = versions.reduce(
    (sum, version) => sum + (version._count?.incidents || 0),
    0
  );

  const totalOpenVulnerabilities = versions.reduce(
    (sum, version) => sum + (version._count?.vulnerabilities || 0),
    0
  );

  return {
    id: product.id,
    name: product.name,
    description: product.description,
    type: product.type,
    productCategory: product.productCategory,
    complianceStatus: product.complianceStatus,
    reportingOrganizations:
      product.reportingOrganizations?.map((org) => org.acronym) || [],
    versionsCount: product._count?.versions || 0,
    activeVersionsCount,
    totalOpenIncidents,
    totalOpenVulnerabilities,
    status: product.status,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
    createdBy: product.createdBy,
    updatedBy: product.updatedBy,
  };
};

/** Transform Prisma product to ProductDetail (full data with relations) */
export const transformToProductDetail = (
  product: ProductDetailPayload
): OscratProductDetail => ({
  id: product.id,
  name: product.name,
  description: product.description,
  type: product.type,
  productCategory: product.productCategory,
  complianceStatus: product.complianceStatus,
  reportingOrganizations: product.reportingOrganizations || [],
  versions:
    product.versions?.map((version) => ({
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
    })) || [],
  status: product.status,
  createdAt: product.createdAt,
  updatedAt: product.updatedAt,
  createdBy: product.createdBy,
  updatedBy: product.updatedBy,
});

// Query functions
/** Get all products for a team */
export const getProducts = async (
  prisma: PrismaClient,
  teamId: string
): Promise<OscratProductSummary[]> => {
  const products = await prisma.oscratProduct.findMany({
    where: { teamId },
    include: PRODUCT_SUMMARY_INCLUDE,
  });

  return products.map(transformToProductSummary);
};

/** Get detailed information for a specific product */
export const getProductDetail = async (
  prisma: PrismaClient,
  teamId: string,
  productId: string
): Promise<OscratProductDetail | null> => {
  const team = await prisma.team.findUnique({
    where: { id: teamId },
    include: {
      products: {
        where: { id: productId },
        include: PRODUCT_DETAIL_INCLUDE,
      },
    },
  });

  const product = team?.products?.[0];
  return product ? transformToProductDetail(product) : null;
};

/** Create a new product for the team */
export const createProduct = async (
  prisma: PrismaClient,
  teamId: string,
  data: OscratProductCreate
): Promise<OscratProductDetail> => {
  const product = await prisma.oscratProduct.create({
    data: {
      name: data.name,
      description: data.description,
      type: data.type,
      productCategory: data.productCategory,
      teamId: teamId,
      createdBy: data.createdBy,
      updatedBy: data.createdBy,
      ...(data.initialVersion && {
        versions: {
          create: {
            version: data.initialVersion.version,
            status: data.initialVersion.status || OscratProductVersionStatus.ACTIVE,
            teamId: teamId,
            createdBy: data.createdBy,
            updatedBy: data.createdBy,
          },
        },
      }),
    },
    include: PRODUCT_DETAIL_INCLUDE,
  });

  return transformToProductDetail(product);
};

// Mutation functions
/** Update an existing product */
export const updateProduct = async (
  prisma: PrismaClient,
  teamId: string,
  productId: string,
  data: Partial<OscratProductUpdate>
): Promise<OscratProductDetail> => {
  // Update the product with team ownership check
  const product = await prisma.oscratProduct.update({
    where: {
      id: productId,
      teamId: teamId,
    },
    data: {
      name: data.name,
      description: data.description,
      type: data.type,
      productCategory: data.productCategory,
      updatedBy: data.updatedBy,
    },
    include: PRODUCT_DETAIL_INCLUDE,
  });

  return transformToProductDetail(product);
};

/** Delete a product */
export const deleteProduct = async (
  prisma: PrismaClient,
  teamId: string,
  productId: string
): Promise<void> => {
  // Delete the product with team ownership check
  await prisma.oscratProduct.delete({
    where: {
      id: productId,
      teamId: teamId,
    },
  });
};
