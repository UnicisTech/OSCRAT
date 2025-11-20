import { PrismaClient, OscratProductComplianceStatus, OscratProductStatus, OscratProductVersionStatus } from '@prisma/client';
import type { TeamDashboardSummary } from '../types/dashboard';
import { OPEN_VULNERABILITY_STATUSES } from '../constants/vulnerability';
import { OPEN_INCIDENT_STATUSES } from '../types/incidents';

/**
 * Get dashboard summary for a team
 */
export const getTeamDashboardSummary = async (
  prisma: PrismaClient,
  teamId: string
): Promise<TeamDashboardSummary> => {
  // Query 1: Count total products
  const totalProducts = await prisma.oscratProduct.count({
    where: { teamId },
  });

  // Query 2: Count products in assessment
  const productsInAssessment = await prisma.oscratProduct.count({
    where: {
      teamId,
      complianceStatus: {
        in: [
          OscratProductComplianceStatus.IN_PROGRESS,
        ],
      },
    },
  });

  // Query 3: Count products with active status
  const productsWithActiveStatus = await prisma.oscratProduct.count({
    where: {
      teamId,
      status: OscratProductStatus.ACTIVE,
    },
  });

  // Query 4: Count products with withdrawn versions
  const productsWithWithdrawnVersions = await prisma.oscratProduct.count({
    where: {
      teamId,
      versions: {
        some: {
          status: OscratProductVersionStatus.WITHDRAWN,
        },
      },
    },
  });

  // Query 5: Count open vulnerabilities across all versions
  const openVulnerabilities = await prisma.oscratProductVulnerability.count({
    where: {
      version: {
        product: {
          teamId,
        },
      },
      status: {
        in: OPEN_VULNERABILITY_STATUSES,
      },
    },
  });

  // Query 6: Count open incidents across all versions
  const openIncidents = await prisma.oscratProductIncident.count({
    where: {
      version: {
        product: {
          teamId,
        },
      },
      status: {
        in: OPEN_INCIDENT_STATUSES,
      },
    },
  });

  // Query 7: Count SBOM reports across all versions
  const sbomReportsCount = await prisma.sbomReport.count({
    where: {
      version: {
        product: {
          teamId,
        },
      },
    },
  });

  return {
    vulnerabilities: {
      open: openVulnerabilities,
    },
    incidents: {
      open: openIncidents,
    },
    sbomReports: {
      total: sbomReportsCount,
    },
    techDocumentation: {
      total: 0,
    },
    products: {
      total: totalProducts,
      inAssessment: productsInAssessment,
      active: productsWithActiveStatus,
      withdrawn: productsWithWithdrawnVersions,
    },
  };
};

