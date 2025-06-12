import { prisma } from '@/lib/prisma';
import {
  OscratProductIncidentStatus,
  OscratProductVulnerabilityStatus,
  type Prisma,
} from '@prisma/client';
import type {
  OscratOrganizationCreate,
  OscratOrganizationUpdate,
  OscratOrganizationSummary,
  OscratOrganizationDetail,
} from '@/types/oscrat/organisation';
import type {
  OscratProductCreate,
  OscratProductUpdate,
  OscratProductSummary,
  OscratProductDetail,
} from '@/types/oscrat/product';
import type {
  OscratAssessmentCreate,
  OscratAssessmentSummary,
  OscratAssessmentDetail,
} from '@/types/oscrat/assessment';

// ========================================================================================
// TYPE DEFINITIONS
// ========================================================================================

/** Prisma product type with count aggregations for summary views */
type PrismaProductWithCounts = Prisma.OscratProductGetPayload<{
  include: {
    reportingOrganizations: true;
    _count: {
      select: {
        incidents: true;
        vulnerabilities: true;
      };
    };
  };
}>;

/** Prisma product type with full relations for detail views */
type PrismaProductWithRelations = Prisma.OscratProductGetPayload<{
  include: {
    reportingOrganizations: true;
    incidents: true;
    vulnerabilities: true;
    assessments: true;
  };
}>;

/** Prisma assessment type for summary views */
type PrismaAssessmentSummary = Prisma.OscratProductAssessmentGetPayload<{
  select: {
    id: true;
    type: true;
    schemaVersion: true;
    productId: true;
    createdAt: true;
    createdBy: true;
  };
}>;

/** Prisma assessment type for detail views */
type PrismaAssessmentDetail = Prisma.OscratProductAssessmentGetPayload<{
  select: {
    id: true;
    type: true;
    schemaVersion: true;
    rawData: true;
    productId: true;
    createdAt: true;
    createdBy: true;
  };
}>;

// ========================================================================================
// QUERY INCLUDES (Reusable Prisma include objects)
// ========================================================================================

/** Include for organization summary queries (with product counts) */
const ORGANIZATION_SUMMARY_INCLUDE = {
  products: {
    include: {
      reportingOrganizations: true,
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
        },
      },
    },
  },
} as const;

/** Include for organization detail queries (with full product relations) */
const ORGANIZATION_DETAIL_INCLUDE = {
  products: {
    include: {
      reportingOrganizations: true,
      incidents: true,
      vulnerabilities: true,
      assessments: true,
    },
  },
} as const;

/** Include for project detail queries */
const PROJECT_DETAIL_INCLUDE = {
  reportingOrganizations: true,
  incidents: true,
  vulnerabilities: true,
  assessments: true,
} as const;

/** Select for assessment summary queries */
const ASSESSMENT_SUMMARY_SELECT = {
  id: true,
  type: true,
  schemaVersion: true,
  productId: true,
  createdAt: true,
  createdBy: true,
} as const;

/** Select for assessment detail queries */
const ASSESSMENT_DETAIL_SELECT = {
  id: true,
  type: true,
  schemaVersion: true,
  rawData: true,
  productId: true,
  createdAt: true,
  createdBy: true,
} as const;

// ========================================================================================
// TRANSFORMATION HELPERS
// ========================================================================================

/** Transform Prisma product to ProductSummary (lightweight with counts) */
const transformToProductSummary = (
  product: PrismaProductWithCounts
): OscratProductSummary => ({
  id: product.id,
  name: product.name,
  type: product.type,
  productCategory: product.productCategory, // Direct mapping, no conversion needed
  complianceStatus: product.complianceStatus,
  externalReportingAcronyms:
    product.reportingOrganizations?.map((org) => org.acronym) || [],
  openIncidents: product._count?.incidents || 0,
  openVulnerabilities: product._count?.vulnerabilities || 0,
  createdAt: product.createdAt,
  updatedAt: product.updatedAt,
  createdBy: product.createdBy,
  updatedBy: product.updatedBy,
});

/** Transform Prisma product to ProductDetail (full data with relations) */
const transformToProductDetail = (
  product: PrismaProductWithRelations
): OscratProductDetail => ({
  id: product.id,
  name: product.name,
  type: product.type,
  productCategory: product.productCategory, // Direct mapping, no conversion needed
  complianceStatus: product.complianceStatus,
  externalReportingAcronyms:
    product.reportingOrganizations?.map((org) => org.acronym) || [],
  incidents:
    product.incidents?.map((incident) => ({
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
    product.vulnerabilities?.map((vuln) => ({
      id: vuln.id,
      name: vuln.name,
      severity: vuln.severity,
      status: vuln.status,
      createdAt: vuln.createdAt,
      updatedAt: vuln.updatedAt,
      createdBy: vuln.createdBy,
      updatedBy: vuln.updatedBy,
      ...(vuln.cve && { cve: vuln.cve }),
    })) || [],
  assessments:
    product.assessments?.map((assessment) => ({
      id: assessment.id,
      type: assessment.type,
      schemaVersion: assessment.schemaVersion,
      productId: assessment.productId,
      createdAt: assessment.createdAt,
      createdBy: assessment.createdBy,
    })) || [],
  createdAt: product.createdAt,
  updatedAt: product.updatedAt,
  createdBy: product.createdBy,
  updatedBy: product.updatedBy,
});

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

/** Transform Prisma assessment to AssessmentSummary */
const transformToAssessmentSummary = (
  assessment: PrismaAssessmentSummary
): OscratAssessmentSummary => ({
  id: assessment.id,
  type: assessment.type,
  schemaVersion: assessment.schemaVersion,
  productId: assessment.productId,
  createdAt: assessment.createdAt,
  createdBy: assessment.createdBy,
});

/** Transform Prisma assessment to AssessmentDetail */
const transformToAssessmentDetail = (
  assessment: PrismaAssessmentDetail
): OscratAssessmentDetail => ({
  id: assessment.id,
  type: assessment.type,
  schemaVersion: assessment.schemaVersion,
  rawData: assessment.rawData as Record<string, any>,
  productId: assessment.productId,
  createdAt: assessment.createdAt,
  createdBy: assessment.createdBy,
});

// ========================================================================================
// ORGANIZATION OPERATIONS
// ========================================================================================

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

// ========================================================================================
// PROJECT OPERATIONS
// ========================================================================================

/** Get all projects for a team's organization */
export const getProjects = async (
  teamId: string
): Promise<OscratProductSummary[]> => {
  const organization = await prisma.oscratOrganization.findFirst({
    where: { teamId },
    include: ORGANIZATION_SUMMARY_INCLUDE,
  });

  return organization?.products.map(transformToProductSummary) || [];
};

/** Get detailed information for a specific project */
export const getProjectDetail = async (
  teamId: string,
  projectId: string
): Promise<OscratProductDetail | null> => {
  const organization = await prisma.oscratOrganization.findFirst({
    where: { teamId },
    include: {
      products: {
        where: { id: projectId },
        include: PROJECT_DETAIL_INCLUDE,
      },
    },
  });

  const product = organization?.products?.[0];
  return product ? transformToProductDetail(product) : null;
};

/** Create a new project under the team's organization */
export const createProject = async (
  teamId: string,
  data: OscratProductCreate
): Promise<OscratProductDetail> => {
  // Find the organization first
  const organization = await prisma.oscratOrganization.findFirst({
    where: { teamId },
    select: { id: true }, // Only need the ID
  });

  if (!organization) {
    throw new Error(`No OSCRAT organization found for team: ${teamId}`);
  }

  // Create the project
  const product = await prisma.oscratProduct.create({
    data: {
      name: data.name,
      type: data.type,
      productCategory: data.productCategory,
      organizationId: organization.id,
      createdBy: data.createdBy,
      updatedBy: data.createdBy,
    },
    include: PROJECT_DETAIL_INCLUDE,
  });

  return transformToProductDetail(product);
};

/** Update an existing project */
export const updateProject = async (
  teamId: string,
  projectId: string,
  data: Partial<OscratProductUpdate>
): Promise<OscratProductDetail> => {
  // Verify project ownership first
  const organization = await prisma.oscratOrganization.findFirst({
    where: { teamId },
    include: {
      products: {
        where: { id: projectId },
        select: { id: true }, // Only need to verify existence
      },
    },
  });

  if (!organization || organization.products.length === 0) {
    throw new Error(`Project ${projectId} not found for team: ${teamId}`);
  }

  // Update the project
  const product = await prisma.oscratProduct.update({
    where: { id: projectId },
    data: {
      name: data.name,
      type: data.type,
      productCategory: data.productCategory, // Direct mapping, no conversion needed
      updatedBy: data.updatedBy,
    },
    include: PROJECT_DETAIL_INCLUDE,
  });

  return transformToProductDetail(product);
};

/** Delete a project */
export const deleteProject = async (
  teamId: string,
  projectId: string
): Promise<void> => {
  // Verify project ownership first
  const organization = await prisma.oscratOrganization.findFirst({
    where: { teamId },
    include: {
      products: {
        where: { id: projectId },
        select: { id: true }, // Only need to verify existence
      },
    },
  });

  if (!organization || organization.products.length === 0) {
    throw new Error(`Project ${projectId} not found for team: ${teamId}`);
  }

  // Delete the project
  await prisma.oscratProduct.delete({
    where: { id: projectId },
  });
};

// ========================================================================================
// ASSESSMENT OPERATIONS
// ========================================================================================

/** Get all assessments for a specific project */
export const getAssessments = async (
  teamId: string,
  projectId: string
): Promise<OscratAssessmentSummary[]> => {
  // Verify project ownership first
  const organization = await prisma.oscratOrganization.findFirst({
    where: { teamId },
    include: {
      products: {
        where: { id: projectId },
        select: { id: true }, // Only need to verify existence
      },
    },
  });

  if (!organization || organization.products.length === 0) {
    throw new Error(`Project ${projectId} not found for team: ${teamId}`);
  }

  const assessments = await prisma.oscratProductAssessment.findMany({
    where: { productId: projectId },
    select: ASSESSMENT_SUMMARY_SELECT,
    orderBy: { createdAt: 'desc' },
  });

  return assessments.map(transformToAssessmentSummary);
};

/** Get detailed information for a specific assessment */
export const getAssessmentDetail = async (
  teamId: string,
  projectId: string,
  assessmentId: string
): Promise<OscratAssessmentDetail | null> => {
  // Verify project ownership first
  const organization = await prisma.oscratOrganization.findFirst({
    where: { teamId },
    include: {
      products: {
        where: { id: projectId },
        select: { id: true }, // Only need to verify existence
      },
    },
  });

  if (!organization || organization.products.length === 0) {
    throw new Error(`Project ${projectId} not found for team: ${teamId}`);
  }

  const assessment = await prisma.oscratProductAssessment.findFirst({
    where: {
      id: assessmentId,
      productId: projectId,
    },
    select: ASSESSMENT_DETAIL_SELECT,
  });

  return assessment ? transformToAssessmentDetail(assessment) : null;
};

/** Create a new assessment for a project */
export const createAssessment = async (
  teamId: string,
  projectId: string,
  data: OscratAssessmentCreate
): Promise<OscratAssessmentDetail> => {
  // Verify project ownership first
  const organization = await prisma.oscratOrganization.findFirst({
    where: { teamId },
    include: {
      products: {
        where: { id: projectId },
        select: { id: true }, // Only need to verify existence
      },
    },
  });

  if (!organization || organization.products.length === 0) {
    throw new Error(`Project ${projectId} not found for team: ${teamId}`);
  }

  const assessment = await prisma.oscratProductAssessment.create({
    data: {
      type: data.type,
      schemaVersion: data.schemaVersion,
      rawData: data.rawData as Prisma.InputJsonValue,
      productId: projectId,
      createdBy: data.createdBy,
    },
    select: ASSESSMENT_DETAIL_SELECT,
  });

  return transformToAssessmentDetail(assessment);
};

/** Delete an assessment */
export const deleteAssessment = async (
  teamId: string,
  projectId: string,
  assessmentId: string
): Promise<void> => {
  // Verify project ownership first
  const organization = await prisma.oscratOrganization.findFirst({
    where: { teamId },
    include: {
      products: {
        where: { id: projectId },
        select: { id: true }, // Only need to verify existence
      },
    },
  });

  if (!organization || organization.products.length === 0) {
    throw new Error(`Project ${projectId} not found for team: ${teamId}`);
  }

  // Verify assessment exists and belongs to this project
  const assessment = await prisma.oscratProductAssessment.findFirst({
    where: {
      id: assessmentId,
      productId: projectId,
    },
    select: { id: true },
  });

  if (!assessment) {
    throw new Error(
      `Assessment ${assessmentId} not found for project ${projectId}`
    );
  }

  // Delete the assessment
  await prisma.oscratProductAssessment.delete({
    where: { id: assessmentId },
  });
};
