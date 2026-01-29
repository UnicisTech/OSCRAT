import {
  PrismaClient,
  type Prisma,
  OscratProductVersionStatus,
} from '@prisma/client';
import type {
  OscratProductCreate,
  OscratProductUpdate,
  OscratProductSummary,
  OscratProductDetail,
  OscratProductSearchRequest,
  OscratProductSearchResult,
} from '../types/product';
import { OPEN_VULNERABILITY_STATUSES } from '../constants/vulnerability';
import { OPEN_INCIDENT_STATUSES } from '../types/incidents';
import { createAuditContextWithTx, logCreate, logUpdate, logDelete, EntityType, type AuditInfo } from '../audit';

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
      conformityAssessmentReport: {
        select: { id: true },
      },
      declarationOfConformity: {
        select: { id: true },
      },
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
    },
  },
};

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
    acronym: product.acronym,
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

export const transformToProductDetail = (
  product: ProductDetailPayload
): OscratProductDetail => ({
  id: product.id,
  name: product.name,
  acronym: product.acronym,
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
      hasConformityAssessmentReport: !!version.conformityAssessmentReport,
      hasDeclarationOfConformity: !!version.declarationOfConformity,
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

export const getProductsWithDetails = async (
  prisma: PrismaClient,
  teamId: string
): Promise<OscratProductDetail[]> => {
  const products = await prisma.oscratProduct.findMany({
    where: { teamId },
    include: PRODUCT_DETAIL_INCLUDE,
  });

  return products.map(transformToProductDetail);
};

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

export const createProduct = async (
  prisma: PrismaClient,
  teamId: string,
  data: OscratProductCreate,
  auditInfo: AuditInfo
): Promise<OscratProductDetail> => {
  return await prisma.$transaction(async (tx) => {
    const audit = createAuditContextWithTx(tx, auditInfo);

    const existingProduct = await tx.oscratProduct.findFirst({
      where: {
        teamId,
        name: {
          equals: data.name.trim(),
          mode: 'insensitive',
        },
      },
      select: { id: true },
    });

    if (existingProduct) {
      throw new Error('A product with this name already exists. Please choose a different name.');
    }

    const product = await tx.oscratProduct.create({
      data: {
        name: data.name,
        acronym: data.acronym,
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
              status:
                data.initialVersion.status || OscratProductVersionStatus.ACTIVE,
              teamId: teamId,
              createdBy: data.createdBy,
              updatedBy: data.createdBy,
            },
          },
        }),
      },
      include: PRODUCT_DETAIL_INCLUDE,
    });

    await logCreate(EntityType.Product, audit, product);

    return transformToProductDetail(product);
  });
};

export const updateProduct = async (
  prisma: PrismaClient,
  teamId: string,
  productId: string,
  data: Partial<OscratProductUpdate>,
  auditInfo: AuditInfo
): Promise<OscratProductDetail> => {
  return await prisma.$transaction(async (tx) => {
    const audit = createAuditContextWithTx(tx, auditInfo);

    const existing = await tx.oscratProduct.findFirst({
      where: { id: productId, teamId },
    });

    if (!existing) {
      throw new Error('Product not found or does not belong to team');
    }

    const product = await tx.oscratProduct.update({
      where: {
        id: productId,
        teamId: teamId,
      },
      data: {
        name: data.name,
        acronym: data.acronym,
        description: data.description,
        type: data.type,
        productCategory: data.productCategory,
        updatedBy: data.updatedBy,
      },
      include: PRODUCT_DETAIL_INCLUDE,
    });

    await logUpdate(EntityType.Product, audit, existing, product);

    return transformToProductDetail(product);
  });
};

export const deleteProduct = async (
  prisma: PrismaClient,
  teamId: string,
  productId: string,
  auditInfo: AuditInfo
): Promise<void> => {
  await prisma.$transaction(async (tx) => {
    const audit = createAuditContextWithTx(tx, auditInfo);

    const product = await tx.oscratProduct.findFirst({
      where: { id: productId, teamId },
      select: { id: true, name: true },
    });

    if (!product) {
      throw new Error('Product not found or does not belong to team');
    }

    await logDelete(EntityType.Product, audit, product);

    await tx.oscratProduct.delete({
      where: {
        id: productId,
        teamId: teamId,
      },
    });
  });
};

/** Helper to convert ProductDetail to SearchResult */
const productDetailToSearchResult = (
  product: OscratProductDetail
): OscratProductSearchResult => ({
  id: product.id,
  name: product.name,
  complianceStatus: product.complianceStatus,
  versions: product.versions,
});

export const searchProducts = async (
  prisma: PrismaClient,
  teamId: string,
  params: OscratProductSearchRequest
): Promise<OscratProductSearchResult[]> => {
  const { productIds, includeVersions = true, includeDetails = false } = params;

  const whereClause: Prisma.OscratProductWhereInput = {
    teamId,
  };

  if (productIds && productIds.length > 0) {
    whereClause.id = {
      in: productIds,
    };
  }

  if (!includeVersions) {
    if (includeDetails) {
      const products = await prisma.oscratProduct.findMany({
        where: whereClause,
        select: {
          id: true,
          name: true,
          complianceStatus: true,
        },
        orderBy: [{ name: 'asc' }],
      });

      return products.map((product) => ({
        id: product.id,
        name: product.name,
        complianceStatus: product.complianceStatus,
        versions: [],
      }));
    }

    const products = await prisma.oscratProduct.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
      },
      orderBy: [{ name: 'asc' }],
    });

    return products.map((product) => ({
      id: product.id,
      name: product.name,
      versions: [],
    }));
  }

  if (includeDetails) {
    const products = await prisma.oscratProduct.findMany({
      where: whereClause,
      include: PRODUCT_DETAIL_INCLUDE,
      orderBy: [{ name: 'asc' }],
    });

    return products
      .map(transformToProductDetail)
      .map(productDetailToSearchResult);
  }

  const products = await prisma.oscratProduct.findMany({
    where: whereClause,
    select: {
      id: true,
      name: true,
      versions: {
        select: {
          id: true,
          version: true,
        },
      },
    },
    orderBy: [{ name: 'asc' }],
  });

  return products.map((product) => ({
    id: product.id,
    name: product.name,
    versions: product.versions.map((version) => ({
      id: version.id,
      version: version.version,
    })),
  }));
};
