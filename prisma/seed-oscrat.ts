import { PrismaClient } from '@prisma/client';
import {
  OscratProductType,
  OscratProductCategory,
  OscratProductComplianceStatus,
  OscratProductRiskLevel,
  OscratConformityProcedure,
  OscratAssessmentType,
  OscratProductVulnerabilitySeverity,
  OscratProductVulnerabilityStatus,
  OscratProductIncidentType,
  OscratProductIncidentStatus,
} from '@prisma/client';

const prisma = new PrismaClient();

// Sample products data
const sampleProducts = [
  {
    name: 'SecureConnect IoT Gateway',
    type: OscratProductType.IOT_DEVICE,
    productCategory: OscratProductCategory.IMPORTANT_CLASS_I,
    complianceStatus: OscratProductComplianceStatus.COMPLIANT,
    conformityProcedure: OscratConformityProcedure.THIRD_PARTY_OPTIONAL,
    riskLevel: OscratProductRiskLevel.MEDIUM,
  },
  {
    name: 'SmartHome Controller Pro',
    type: OscratProductType.SMART_HOME_DEVICE,
    productCategory: OscratProductCategory.DEFAULT,
    complianceStatus: OscratProductComplianceStatus.IN_PROGRESS,
    conformityProcedure: OscratConformityProcedure.SELF_ASSESSMENT,
    riskLevel: OscratProductRiskLevel.LOW,
  },
  {
    name: 'Industrial Monitoring System',
    type: OscratProductType.INDUSTRIAL_DEVICE,
    productCategory: OscratProductCategory.CRITICAL,
    complianceStatus: OscratProductComplianceStatus.CERTIFIED,
    conformityProcedure: OscratConformityProcedure.EUCC_CERTIFICATION,
    riskLevel: OscratProductRiskLevel.CRITICAL,
  },
  {
    name: 'CyberShield Security Suite',
    type: OscratProductType.SECURITY_SOFTWARE,
    productCategory: OscratProductCategory.IMPORTANT_CLASS_II,
    complianceStatus: OscratProductComplianceStatus.COMPLIANT,
    conformityProcedure: OscratConformityProcedure.THIRD_PARTY_MANDATORY,
    riskLevel: OscratProductRiskLevel.HIGH,
  },
  {
    name: 'EdgeDevice Firmware v2.1',
    type: OscratProductType.FIRMWARE,
    productCategory: OscratProductCategory.DEFAULT,
    complianceStatus: OscratProductComplianceStatus.NOT_ASSESSED,
    conformityProcedure: OscratConformityProcedure.SELF_ASSESSMENT,
    riskLevel: OscratProductRiskLevel.MEDIUM,
  },
  {
    name: 'CloudConnector API Platform',
    type: OscratProductType.APPLICATION_SOFTWARE,
    productCategory: OscratProductCategory.IMPORTANT_CLASS_I,
    complianceStatus: OscratProductComplianceStatus.PENDING_CERTIFICATION,
    conformityProcedure: OscratConformityProcedure.THIRD_PARTY_OPTIONAL,
    riskLevel: OscratProductRiskLevel.MEDIUM,
  },
];

// Sample CRA assessment data
const sampleCRAAssessment = {
  type: OscratAssessmentType.CRA,
  schemaVersion: '1.0.0',
  rawData: {
    product_info: {
      name: 'Product Assessment',
      version: '1.0',
      category: 'IoT Device',
    },
    cybersecurity_requirements: {
      authentication: {
        implemented: true,
        methods: ['multi-factor', 'certificate-based'],
        rating: 'compliant',
      },
      encryption: {
        implemented: true,
        algorithms: ['AES-256', 'RSA-2048'],
        rating: 'compliant',
      },
      secure_communication: {
        implemented: true,
        protocols: ['TLS 1.3', 'HTTPS'],
        rating: 'compliant',
      },
      vulnerability_management: {
        implemented: true,
        update_mechanism: 'automatic',
        disclosure_process: true,
        rating: 'compliant',
      },
    },
    risk_assessment: {
      overall_risk: 'medium',
      identified_risks: [
        {
          category: 'data_confidentiality',
          severity: 'medium',
          mitigation: 'encryption_at_rest',
        },
        {
          category: 'network_security',
          severity: 'low',
          mitigation: 'network_segmentation',
        },
      ],
    },
    compliance_checklist: {
      essential_requirements: {
        security_by_design: true,
        risk_assessment_conducted: true,
        vulnerability_handling: true,
        security_updates: true,
        incident_response: true,
      },
      conformity_assessment: {
        procedure: 'self_assessment',
        documentation_complete: true,
        technical_compliance: true,
      },
    },
  },
};

// Sample ORG assessment data
const sampleORGAssessment = {
  type: OscratAssessmentType.ORG,
  schemaVersion: '1.0.0',
  rawData: {
    organization_info: {
      assessment_date: new Date().toISOString(),
      scope: 'cybersecurity_processes',
    },
    governance: {
      cybersecurity_policy: {
        exists: true,
        last_updated: '2024-01-15',
        rating: 'adequate',
      },
      risk_management_process: {
        exists: true,
        framework: 'ISO 27001',
        rating: 'good',
      },
      incident_response_plan: {
        exists: true,
        tested: true,
        last_test: '2023-12-01',
        rating: 'good',
      },
    },
    processes: {
      vulnerability_management: {
        process_defined: true,
        tools_used: ['vulnerability_scanner', 'penetration_testing'],
        frequency: 'quarterly',
        rating: 'good',
      },
      security_awareness: {
        training_program: true,
        frequency: 'annual',
        completion_rate: 95,
        rating: 'good',
      },
      supplier_management: {
        security_requirements: true,
        assessment_process: true,
        rating: 'adequate',
      },
    },
    technical_measures: {
      network_security: {
        firewalls: true,
        intrusion_detection: true,
        network_segmentation: true,
        rating: 'good',
      },
      access_control: {
        multi_factor_auth: true,
        privileged_access_management: true,
        regular_access_reviews: true,
        rating: 'good',
      },
      data_protection: {
        encryption_at_rest: true,
        encryption_in_transit: true,
        backup_strategy: true,
        rating: 'good',
      },
    },
  },
};

// Sample vulnerabilities
const sampleVulnerabilities = [
  {
    name: 'Buffer Overflow in Authentication Module',
    description:
      'A buffer overflow vulnerability exists in the authentication module that could allow remote code execution.',
    severity: OscratProductVulnerabilitySeverity.HIGH,
    status: OscratProductVulnerabilityStatus.PATCHED,
    cve: 'CVE-2024-1234',
  },
  {
    name: 'Weak Cryptographic Implementation',
    description:
      'The product uses deprecated cryptographic algorithms in certain scenarios.',
    severity: OscratProductVulnerabilitySeverity.MEDIUM,
    status: OscratProductVulnerabilityStatus.MITIGATED,
    cve: null,
  },
  {
    name: 'Information Disclosure via API',
    description:
      'Sensitive information can be disclosed through improperly secured API endpoints.',
    severity: OscratProductVulnerabilitySeverity.LOW,
    status: OscratProductVulnerabilityStatus.OPEN,
    cve: null,
  },
  {
    name: 'SQL Injection in Web Interface',
    description:
      'User input is not properly sanitized, allowing SQL injection attacks.',
    severity: OscratProductVulnerabilitySeverity.HIGH,
    status: OscratProductVulnerabilityStatus.OPEN,
    cve: 'CVE-2024-5678',
  },
  {
    name: 'Cross-Site Scripting (XSS)',
    description:
      'Reflected XSS vulnerability in the admin dashboard allows code execution.',
    severity: OscratProductVulnerabilitySeverity.MEDIUM,
    status: OscratProductVulnerabilityStatus.OPEN,
    cve: null,
  },
  {
    name: 'Privilege Escalation via API',
    description:
      'Low-privilege users can escalate to admin privileges through API manipulation.',
    severity: OscratProductVulnerabilitySeverity.CRITICAL,
    status: OscratProductVulnerabilityStatus.ACTIVELY_EXPLOITED,
    cve: 'CVE-2024-9999',
  },
  {
    name: 'Hardcoded Debug Credentials',
    description:
      'Development credentials found hardcoded in production firmware.',
    severity: OscratProductVulnerabilitySeverity.HIGH,
    status: OscratProductVulnerabilityStatus.ACCEPTED_RISK,
    cve: null,
  },
];

// Sample incidents
const sampleIncidents = [
  {
    name: 'Unauthorized Access Attempt',
    description:
      'Multiple failed authentication attempts detected from external IP addresses.',
    type: OscratProductIncidentType.AUTHENTICATION_BYPASS,
    status: OscratProductIncidentStatus.FINAL_REPORT_SENT,
    incidentReference: 'INC-2024-001',
  },
  {
    name: 'Firmware Update Mechanism Failure',
    description:
      'The automatic update mechanism failed to apply critical security patches.',
    type: OscratProductIncidentType.UPDATE_MECHANISM_FAILURE,
    status: OscratProductIncidentStatus.DETAILED_REPORT_SENT,
    incidentReference: 'INC-2024-002',
  },
  {
    name: 'Supply Chain Compromise',
    description:
      'Third-party component found to contain malicious code affecting product security.',
    type: OscratProductIncidentType.SUPPLY_CHAIN_INCIDENT,
    status: OscratProductIncidentStatus.INITIAL_ALERT_SENT,
    incidentReference: null,
  },
  {
    name: 'Cryptographic Key Exposure',
    description:
      'Private cryptographic keys were inadvertently exposed in a software update.',
    type: OscratProductIncidentType.CRYPTOGRAPHIC_FAILURE,
    status: OscratProductIncidentStatus.REPORTING_COMPLETE,
    incidentReference: 'INC-2024-004',
  },
  {
    name: 'DDoS Attack on Product Services',
    description:
      'Distributed denial of service attack targeted product cloud services.',
    type: OscratProductIncidentType.DENIAL_OF_SERVICE,
    status: OscratProductIncidentStatus.FINAL_REPORT_SENT,
    incidentReference: null,
  },
  {
    name: 'Configuration Vulnerability Discovered',
    description:
      'Security researcher found default credentials in production configuration.',
    type: OscratProductIncidentType.CONFIGURATION_EXPLOIT,
    status: OscratProductIncidentStatus.NOT_REPORTED,
    incidentReference: null,
  },
  {
    name: 'Memory Corruption in Data Processing',
    description: 'Buffer overflow discovered during internal security audit.',
    type: OscratProductIncidentType.VULNERABILITY_EXPLOIT,
    status: OscratProductIncidentStatus.NOT_REPORTED,
    incidentReference: null,
  },
  {
    name: 'Network Intrusion Detected',
    description:
      'Suspicious network activity detected on product management interface.',
    type: OscratProductIncidentType.NETWORK_INTRUSION,
    status: OscratProductIncidentStatus.NOT_REPORTED,
    incidentReference: null,
  },
];

// Sample reporting organizations
const sampleReportingOrganizations = [
  {
    name: 'European Union Agency for Cybersecurity',
    acronym: 'ENISA',
    reportingEmail: 'csirt-reports@enisa.europa.eu',
  },
  {
    name: 'National Cybersecurity Agency',
    acronym: 'NCA',
    reportingEmail: 'incidents@nca.gov',
  },
  {
    name: 'Critical Infrastructure Protection Office',
    acronym: 'CIPO',
    reportingEmail: 'critical-incidents@cipo.org',
  },
];

async function seedOscratData(organizationIdOrSlug: string) {
  try {
    let organization;

    // Try to find organization by ID first
    organization = await prisma.oscratOrganization.findUnique({
      where: { id: organizationIdOrSlug },
      select: { id: true, createdBy: true, name: true },
    });

    // If not found by ID, try to find by team slug
    if (!organization) {
      const team = await prisma.team.findUnique({
        where: { slug: organizationIdOrSlug },
        include: {
          oscratOrganization: {
            select: { id: true, createdBy: true, name: true },
          },
        },
      });

      if (team?.oscratOrganization) {
        organization = team.oscratOrganization;
      }
    }

    if (!organization) {
      throw new Error(
        `Organization with ID or team slug "${organizationIdOrSlug}" not found.`
      );
    }

    const targetOrgId = organization.id;
    const targetUserId = organization.createdBy;

    console.log(
      `Seeding OSCRAT data for organization: ${organization.name} (${targetOrgId})`
    );
    console.log(`Using creator: ${targetUserId}`);

    // Clean up existing data for this organization
    console.log('Cleaning up existing data...');

    // First get all products for this organization to clean up their related data
    const existingProducts = await prisma.oscratProduct.findMany({
      where: { organizationId: targetOrgId },
      select: { id: true },
    });

    if (existingProducts.length > 0) {
      const productIds = existingProducts.map((p) => p.id);

      // Delete vulnerabilities
      const deletedVulnerabilities =
        await prisma.oscratProductVulnerability.deleteMany({
          where: { productId: { in: productIds } },
        });

      // Delete incidents
      const deletedIncidents = await prisma.oscratProductIncident.deleteMany({
        where: { productId: { in: productIds } },
      });

      // Delete assessments
      const deletedAssessments =
        await prisma.oscratProductAssessment.deleteMany({
          where: { productId: { in: productIds } },
        });

      console.log(
        `   • Removed ${deletedVulnerabilities.count} existing vulnerabilities`
      );
      console.log(`   • Removed ${deletedIncidents.count} existing incidents`);
      console.log(
        `   • Removed ${deletedAssessments.count} existing assessments`
      );
    }

    // Delete existing products
    const deletedProducts = await prisma.oscratProduct.deleteMany({
      where: { organizationId: targetOrgId },
    });

    console.log(`   • Removed ${deletedProducts.count} existing products`);

    // Delete existing reporting organizations
    const deletedReportingOrgs =
      await prisma.oscratReportingOrganization.deleteMany({
        where: { organizationId: targetOrgId },
      });

    console.log(
      `   • Removed ${deletedReportingOrgs.count} existing reporting organizations`
    );

    // Create products
    const createdProducts: any[] = [];

    for (const productData of sampleProducts) {
      console.log(`Creating product: ${productData.name}`);

      const product = await prisma.oscratProduct.create({
        data: {
          name: productData.name,
          type: productData.type,
          productCategory: productData.productCategory,
          complianceStatus: productData.complianceStatus,
          conformityProcedure: productData.conformityProcedure,
          riskLevel: productData.riskLevel,
          organizationId: targetOrgId,
          createdBy: targetUserId,
          updatedBy: targetUserId,
        },
      });

      createdProducts.push(product);

      // Create CRA assessment for each product (product-specific)
      const craAssessment = {
        type: sampleCRAAssessment.type,
        schemaVersion: sampleCRAAssessment.schemaVersion,
        rawData: {
          ...sampleCRAAssessment.rawData,
          product_info: {
            ...sampleCRAAssessment.rawData.product_info,
            name: productData.name,
          },
        },
      };

      console.log(
        `Creating ${craAssessment.type} assessment for ${productData.name}`
      );

      await prisma.oscratProductAssessment.create({
        data: {
          type: craAssessment.type,
          schemaVersion: craAssessment.schemaVersion,
          rawData: craAssessment.rawData,
          productId: product.id,
          createdBy: targetUserId,
        },
      });

      // Add vulnerabilities to some products
      if (Math.random() > 0.5) {
        const numVulns =
          Math.floor(Math.random() * sampleVulnerabilities.length) + 1;
        const selectedVulns = sampleVulnerabilities.slice(0, numVulns);

        for (const vulnData of selectedVulns) {
          console.log(
            `Creating vulnerability: ${vulnData.name} for ${productData.name}`
          );

          await prisma.oscratProductVulnerability.create({
            data: {
              name: vulnData.name,
              description: vulnData.description,
              severity: vulnData.severity,
              status: vulnData.status,
              cve: vulnData.cve,
              productId: product.id,
              createdBy: targetUserId,
              updatedBy: targetUserId,
            },
          });
        }
      }

      // Add incidents to products (ensure every product gets at least 1, some get more)
      const minIncidents = 1;
      const maxIncidents = Math.min(3, sampleIncidents.length);
      const numIncidents =
        Math.floor(Math.random() * (maxIncidents - minIncidents + 1)) +
        minIncidents;

      // Shuffle incidents and take the required number
      const shuffledIncidents = [...sampleIncidents].sort(
        () => Math.random() - 0.5
      );
      const selectedIncidents = shuffledIncidents.slice(0, numIncidents);

      for (const incidentData of selectedIncidents) {
        console.log(
          `Creating incident: ${incidentData.name} for ${productData.name}`
        );

        // Generate reference ID only for incidents that have one in the template
        const incidentReference = incidentData.incidentReference
          ? `${incidentData.incidentReference}-${product.id.slice(-4)}`
          : null;

        await prisma.oscratProductIncident.create({
          data: {
            name: incidentData.name,
            description: incidentData.description,
            type: incidentData.type,
            status: incidentData.status,
            incidentReference: incidentReference,
            productId: product.id,
            createdBy: targetUserId,
            updatedBy: targetUserId,
          },
        });
      }
    }

    // Create reporting organizations and assign products
    console.log('Creating reporting organizations...');
    const createdReportingOrgs: any[] = [];

    for (const reportingOrgData of sampleReportingOrganizations) {
      console.log(`Creating reporting organization: ${reportingOrgData.name}`);

      const reportingOrg = await prisma.oscratReportingOrganization.create({
        data: {
          name: reportingOrgData.name,
          acronym: reportingOrgData.acronym,
          reportingEmail: reportingOrgData.reportingEmail,
          organizationId: targetOrgId,
          createdBy: targetUserId,
          updatedBy: targetUserId,
        },
      });

      createdReportingOrgs.push(reportingOrg);

      // Assign random products to this reporting organization (1-3 products each)
      const numProductsToAssign = Math.floor(Math.random() * 3) + 1;
      const shuffledProducts = [...createdProducts].sort(
        () => Math.random() - 0.5
      );
      const productsToAssign = shuffledProducts.slice(0, numProductsToAssign);

      for (const product of productsToAssign) {
        console.log(`Assigning ${product.name} to ${reportingOrgData.acronym}`);

        await prisma.oscratProduct.update({
          where: { id: product.id },
          data: {
            reportingOrganizations: {
              connect: { id: reportingOrg.id },
            },
          },
        });
      }
    }

    console.log(
      `Successfully seeded ${createdProducts.length} products with assessments!`
    );
    console.log('Summary:');
    console.log(`   • Products: ${createdProducts.length}`);
    console.log(
      `   • CRA Assessments: ${createdProducts.length} (one per product)`
    );

    // Count vulnerabilities and incidents
    const vulnCount = await prisma.oscratProductVulnerability.count({
      where: {
        product: {
          organizationId: targetOrgId,
        },
      },
    });

    const incidentCount = await prisma.oscratProductIncident.count({
      where: {
        product: {
          organizationId: targetOrgId,
        },
      },
    });

    console.log(`   • Vulnerabilities: ${vulnCount}`);
    console.log(`   • Incidents: ${incidentCount}`);

    return createdProducts;
  } catch (error) {
    console.error('Error seeding OSCRAT data:', error);
    throw error;
  }
}

// CLI execution
async function main() {
  const args = process.argv.slice(2);
  const organizationIdOrSlug = args[0];

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Usage: pnpm tsx prisma/seed-oscrat.ts <organizationId|teamSlug>

Arguments:
  organizationId|teamSlug  Required. Either the ID of the OSCRAT organization 
                          or the slug of the team associated with the organization.
                          The script will use the organization's creator as the user for all records.

Examples:
  pnpm tsx prisma/seed-oscrat.ts abc123-def456-ghi789    # Using organization ID
  pnpm tsx prisma/seed-oscrat.ts oscrat_team            # Using team slug
  pnpm run seed:oscrat oscrat_team                      # Using team slug

Options:
  --help, -h      Show this help message
    `);
    process.exit(0);
  }

  if (!organizationIdOrSlug) {
    console.error('Error: Organization ID or team slug is required.');
    console.log(
      'Usage: pnpm tsx prisma/seed-oscrat.ts <organizationId|teamSlug>'
    );
    console.log('Run with --help for more information.');
    process.exit(1);
  }

  await seedOscratData(organizationIdOrSlug);
}

// Export for programmatic use
export { seedOscratData };

// Run if called directly
if (require.main === module) {
  main()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
