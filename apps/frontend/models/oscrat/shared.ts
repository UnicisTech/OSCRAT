import type { Prisma } from '@oscrat/model';
import type {
  OscratProductSummary,
  OscratProductDetail,
  OscratAssessmentSummary,
  OscratAssessmentDetail,
  OscratProductVersionSummary,
  OscratProductVersionDetail,
} from '@oscrat/model';

/** Prisma product type with count aggregations for summary views */
export type PrismaProductWithCounts = Prisma.OscratProductGetPayload<{
  include: {
    reportingOrganizations: true;
    _count: {
      select: {
        versions: true;
      };
    };
    versions: {
      select: {
        id: true;
        status: true;
        _count: {
          select: {
            incidents: { where: { status: 'NOT_REPORTED' } };
            vulnerabilities: {
              where: {
                status: {
                  in: ['OPEN', 'ACTIVELY_EXPLOITED'];
                };
              };
            };
          };
        };
      };
    };
  };
}>;

/** Prisma product type with full relations for detail views */
export type PrismaProductWithRelations = Prisma.OscratProductGetPayload<{
  include: {
    reportingOrganizations: true;
    versions: {
      include: {
        repository: {
          select: {
            id: true;
          };
        };
        _count: {
          select: {
            incidents: { where: { status: 'NOT_REPORTED' } };
            vulnerabilities: {
              where: {
                status: {
                  in: ['OPEN', 'ACTIVELY_EXPLOITED'];
                };
              };
            };
            sbomReports: true;
          };
        };
      };
    };
  };
}>;

/** Prisma assessment type for summary views */
export type PrismaAssessmentSummary = Prisma.OscratProductAssessmentGetPayload<{
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
export type PrismaAssessmentDetail = Prisma.OscratProductAssessmentGetPayload<{
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

/** Transform Prisma product to ProductSummary (lightweight with counts) */
export const transformToProductSummary = (
  product: PrismaProductWithCounts
): OscratProductSummary => {
  const versions = product.versions || [];

  const activeVersionsCount = versions.filter(
    (version) => version.status === 'ACTIVE'
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
      product.reportingOrganizations?.map((org: any) => org.acronym) || [],
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
  product: PrismaProductWithRelations
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

/** Transform Prisma assessment to AssessmentSummary */
export const transformToAssessmentSummary = (
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
export const transformToAssessmentDetail = (
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

/** Prisma version type for summary views */
export type PrismaVersionWithCounts = Prisma.OscratProductVersionGetPayload<{
  include: {
    _count: {
      select: {
        incidents: { where: { status: 'NOT_REPORTED' } };
        vulnerabilities: {
          where: {
            status: {
              in: ['OPEN', 'ACTIVELY_EXPLOITED'];
            };
          };
        };
        sbomReports: true;
      };
    };
    repository: {
      select: {
        id: true;
      };
    };
  };
}>;

/** Prisma version type for detail views */
export type PrismaVersionWithRelations = Prisma.OscratProductVersionGetPayload<{
  include: {
    incidents: true;
    vulnerabilities: true;
    assessments: true;
    repository: {
      select: {
        id: true;
        name: true;
        provider: true;
        repositoryUrl: true;
        targetBranch: true;
        targetTag: true;
        targetCommit: true;
      };
    };
    _count: {
      select: {
        sbomReports: true;
      };
    };
  };
}>;

/** Transform Prisma version to VersionSummary */
export const transformToVersionSummary = (
  version: PrismaVersionWithCounts
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
  version: PrismaVersionWithRelations
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
