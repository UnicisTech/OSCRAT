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
  OscratProductVersionStatus,
} from '@prisma/client';

const prisma = new PrismaClient();

// Sample products data
const sampleProducts = [
  {
    name: 'SecureConnect IoT Gateway',
    description:
      'Enterprise-grade IoT gateway solution providing secure connectivity and device management for industrial IoT deployments.',
    type: OscratProductType.IOT_DEVICE,
    productCategory: OscratProductCategory.IMPORTANT_CLASS_I,
    complianceStatus: OscratProductComplianceStatus.COMPLIANT,
    conformityProcedure: OscratConformityProcedure.THIRD_PARTY_OPTIONAL,
    riskLevel: OscratProductRiskLevel.MEDIUM,
  },
  {
    name: 'SmartHome Controller Pro',
    description:
      'Advanced home automation controller supporting multiple protocols and seamless integration with popular smart home ecosystems.',
    type: OscratProductType.SMART_HOME_DEVICE,
    productCategory: OscratProductCategory.DEFAULT,
    complianceStatus: OscratProductComplianceStatus.IN_PROGRESS,
    conformityProcedure: OscratConformityProcedure.SELF_ASSESSMENT,
    riskLevel: OscratProductRiskLevel.LOW,
  },
  {
    name: 'Industrial Monitoring System',
    description:
      'Real-time monitoring and control system for critical industrial infrastructure with built-in redundancy and failover capabilities.',
    type: OscratProductType.INDUSTRIAL_DEVICE,
    productCategory: OscratProductCategory.CRITICAL,
    complianceStatus: OscratProductComplianceStatus.CERTIFIED,
    conformityProcedure: OscratConformityProcedure.EUCC_CERTIFICATION,
    riskLevel: OscratProductRiskLevel.CRITICAL,
  },
  {
    name: 'CyberShield Security Suite',
    description:
      'Comprehensive cybersecurity platform offering threat detection, vulnerability management, and incident response capabilities.',
    type: OscratProductType.SECURITY_SOFTWARE,
    productCategory: OscratProductCategory.IMPORTANT_CLASS_II,
    complianceStatus: OscratProductComplianceStatus.COMPLIANT,
    conformityProcedure: OscratConformityProcedure.THIRD_PARTY_MANDATORY,
    riskLevel: OscratProductRiskLevel.HIGH,
  },
  {
    name: 'EdgeDevice Firmware v2.1',
    description:
      'Optimized firmware for edge computing devices with enhanced security features and improved resource management.',
    type: OscratProductType.FIRMWARE,
    productCategory: OscratProductCategory.DEFAULT,
    complianceStatus: OscratProductComplianceStatus.NOT_ASSESSED,
    conformityProcedure: OscratConformityProcedure.SELF_ASSESSMENT,
    riskLevel: OscratProductRiskLevel.MEDIUM,
  },
  {
    name: 'CloudConnector API Platform',
    description:
      'Scalable API management platform enabling secure cloud connectivity and data integration across hybrid environments.',
    type: OscratProductType.APPLICATION_SOFTWARE,
    productCategory: OscratProductCategory.IMPORTANT_CLASS_I,
    complianceStatus: OscratProductComplianceStatus.PENDING_CERTIFICATION,
    conformityProcedure: OscratConformityProcedure.THIRD_PARTY_OPTIONAL,
    riskLevel: OscratProductRiskLevel.MEDIUM,
  },
];

// Sample version data for each product
const sampleVersions = [
  ['1.0.0', '1.1.0', '1.2.0'],
  ['2.0.0', '2.1.0'],
  ['3.0.0', '3.0.1', '3.1.0', '3.2.0'],
  ['1.0.0', '1.1.0'],
  ['2.1.0', '2.1.1'],
  ['1.0.0', '1.0.1', '1.1.0'],
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

// Sample organization contact data arrays for randomization
const sampleTaxIds = [
  'EU123456789',
  'US98-7654321',
  'GB999999999',
  'DE123456789',
  'FR12345678901',
  'NL123456789B01',
  'SE123456789001',
  'CH-123.456.789',
];

const sampleAddresses = [
  '123 Innovation Street, Tech District, Brussels 1000, Belgium',
  '456 Silicon Avenue, San Francisco, CA 94105, USA',
  '789 Cyber Lane, London EC1A 1BB, United Kingdom',
  '321 Security Boulevard, Berlin 10115, Germany',
  '654 Digital Plaza, Amsterdam 1012 AB, Netherlands',
  '987 Tech Park, Stockholm 111 21, Sweden',
  '147 Innovation Hub, Zurich 8001, Switzerland',
  '258 Compliance Center, Paris 75001, France',
];

const sampleContactEmails = [
  'contact@cybertech-solutions.com',
  'info@secureiot-innovations.eu',
  'hello@digitalsafety-org.net',
  'support@compliancetech.co.uk',
  'office@cybersecurity-experts.de',
  'team@iotsecurity-lab.nl',
  'contact@techcompliance.se',
  'info@securityfirst.ch',
];

const samplePhoneNumbers = [
  '+32 2 123 4567',
  '+1 415 555 0123',
  '+44 20 7123 4567',
  '+49 30 12345678',
  '+31 20 123 4567',
  '+46 8 123 456 78',
  '+41 44 123 45 67',
  '+33 1 42 34 56 78',
];

const sampleAdditionalInfo = [
  'Cybersecurity compliance organization specializing in IoT and critical infrastructure security. Member of ENISA network since 2020. ISO 27001 certified.',
  'Leading technology security firm focused on industrial automation and smart city solutions. NIST Cybersecurity Framework certified since 2019.',
  'Digital safety consultancy with expertise in financial services and healthcare compliance. SOC 2 Type II and HIPAA compliant.',
  'European cybersecurity research institute developing next-generation threat detection systems. Horizon Europe program participant.',
  'IoT security laboratory providing penetration testing and vulnerability assessments. OWASP member organization.',
  'Compliance technology startup specializing in automated security monitoring for SMEs. ISO 27001 and GDPR certified.',
  'Nordic cybersecurity center of excellence focusing on 5G and edge computing security. EU Digital Single Market contributor.',
  'Swiss cybersecurity consulting firm with focus on banking and finance sector. FINMA regulated and PCI DSS certified.',
];

/** Generate random organization contact data */
function generateRandomOrganizationData() {
  const getRandomItem = <T>(array: T[]): T =>
    array[Math.floor(Math.random() * array.length)];

  return {
    taxId: getRandomItem(sampleTaxIds),
    postalAddress: getRandomItem(sampleAddresses),
    contactEmail: getRandomItem(sampleContactEmails),
    contactPhone: getRandomItem(samplePhoneNumbers),
    additionalInformation: getRandomItem(sampleAdditionalInfo),
  };
}

async function seedOscratData(teamSlug: string) {
  try {
    // Find team by slug (unified Team/Organization model)
    const team = await prisma.team.findUnique({
      where: { slug: teamSlug },
      select: {
        id: true,
        name: true,
        members: {
          where: { role: 'OWNER' },
          select: { userId: true },
          take: 1,
        },
      },
    });

    if (!team) {
      throw new Error(`Team with slug "${teamSlug}" not found.`);
    }

    const targetTeamId = team.id;
    const targetUserId = team.members[0]?.userId;

    if (!targetUserId) {
      throw new Error(`No owner found for team "${teamSlug}".`);
    }

    console.log(`Seeding OSCRAT data for team: ${team.name} (${targetTeamId})`);
    console.log(`Using creator: ${targetUserId}`);

    // Generate and update team with random organization contact data
    const organizationData = generateRandomOrganizationData();
    console.log(
      'Updating team with random organization contact information...'
    );
    await prisma.team.update({
      where: { id: targetTeamId },
      data: {
        taxId: organizationData.taxId,
        postalAddress: organizationData.postalAddress,
        contactEmail: organizationData.contactEmail,
        contactPhone: organizationData.contactPhone,
        additionalInformation: organizationData.additionalInformation,
      },
    });

    // Clean up existing data for this team
    console.log('Cleaning up existing data...');

    // First get all products for this team to clean up their related data
    const existingProducts = await prisma.oscratProduct.findMany({
      where: { teamId: targetTeamId },
      select: { id: true },
    });

    if (existingProducts.length > 0) {
      const productIds = existingProducts.map((p) => p.id);

      // Get all versions for these products
      const existingVersions = await prisma.oscratProductVersion.findMany({
        where: { productId: { in: productIds } },
        select: { id: true },
      });

      if (existingVersions.length > 0) {
        const versionIds = existingVersions.map((v) => v.id);

        // Delete version-related data
        const deletedVulnerabilities =
          await prisma.oscratProductVulnerability.deleteMany({
            where: { versionId: { in: versionIds } },
          });

        const deletedIncidents = await prisma.oscratProductIncident.deleteMany({
          where: { versionId: { in: versionIds } },
        });

        const deletedAssessments =
          await prisma.oscratProductAssessment.deleteMany({
            where: { versionId: { in: versionIds } },
          });

        // Delete repositories
        const deletedRepositories = await prisma.oscratRepository.deleteMany({
          where: { versionId: { in: versionIds } },
        });

        console.log(
          `   • Removed ${deletedVulnerabilities.count} existing vulnerabilities`
        );
        console.log(
          `   • Removed ${deletedIncidents.count} existing incidents`
        );
        console.log(
          `   • Removed ${deletedAssessments.count} existing assessments`
        );
        console.log(
          `   • Removed ${deletedRepositories.count} existing repositories`
        );

        // Delete versions
        const deletedVersions = await prisma.oscratProductVersion.deleteMany({
          where: { productId: { in: productIds } },
        });
        console.log(`   • Removed ${deletedVersions.count} existing versions`);
      }
    }

    // Delete existing products
    const deletedProducts = await prisma.oscratProduct.deleteMany({
      where: { teamId: targetTeamId },
    });

    console.log(`   • Removed ${deletedProducts.count} existing products`);

    // Delete existing reporting organizations
    const deletedReportingOrgs =
      await prisma.oscratReportingOrganization.deleteMany({
        where: { teamId: targetTeamId },
      });

    console.log(
      `   • Removed ${deletedReportingOrgs.count} existing reporting organizations`
    );

    // Create products with versions
    const createdProducts: any[] = [];
    const createdVersions: any[] = [];

    for (let i = 0; i < sampleProducts.length; i++) {
      const productData = sampleProducts[i];
      const versionData = sampleVersions[i] || ['1.0.0'];

      console.log(`Creating product: ${productData.name}`);

      const product = await prisma.oscratProduct.create({
        data: {
          name: productData.name,
          description: productData.description,
          type: productData.type,
          productCategory: productData.productCategory,
          complianceStatus: productData.complianceStatus,
          conformityProcedure: productData.conformityProcedure,
          riskLevel: productData.riskLevel,
          teamId: targetTeamId,
          createdBy: targetUserId,
          updatedBy: targetUserId,
        },
      });

      createdProducts.push(product);

      // Create versions for this product
      for (let j = 0; j < versionData.length; j++) {
        const versionString = versionData[j];
        const isLatest = j === versionData.length - 1;
        const versionStatus = isLatest
          ? OscratProductVersionStatus.ACTIVE
          : j === versionData.length - 2
            ? OscratProductVersionStatus.DEPRECATED
            : OscratProductVersionStatus.ARCHIVED;

        console.log(
          `Creating version: ${versionString} for ${productData.name}`
        );

        const version = await prisma.oscratProductVersion.create({
          data: {
            version: versionString,
            status: versionStatus,
            productId: product.id,
            createdBy: targetUserId,
            updatedBy: targetUserId,
          },
        });

        createdVersions.push({ ...version, productName: productData.name });

        // Create CRA assessment for each version
        const craAssessment = {
          type: sampleCRAAssessment.type,
          schemaVersion: sampleCRAAssessment.schemaVersion,
          rawData: {
            ...sampleCRAAssessment.rawData,
            product_info: {
              ...sampleCRAAssessment.rawData.product_info,
              name: productData.name,
              version: versionString,
            },
          },
        };

        console.log(
          `Creating ${craAssessment.type} assessment for ${productData.name} v${versionString}`
        );

        await prisma.oscratProductAssessment.create({
          data: {
            type: craAssessment.type,
            schemaVersion: craAssessment.schemaVersion,
            rawData: craAssessment.rawData,
            versionId: version.id,
            productId: product.id,
            createdBy: targetUserId,
          },
        });

        // Add vulnerabilities to some versions (more likely for newer versions)
        if (Math.random() > 0.4) {
          const numVulns =
            Math.floor(Math.random() * sampleVulnerabilities.length) + 1;
          const selectedVulns = sampleVulnerabilities.slice(0, numVulns);

          for (const vulnData of selectedVulns) {
            console.log(
              `Creating vulnerability: ${vulnData.name} for ${productData.name} v${versionString}`
            );

            await prisma.oscratProductVulnerability.create({
              data: {
                name: vulnData.name,
                description: vulnData.description,
                severity: vulnData.severity,
                status: vulnData.status,
                cve: vulnData.cve,
                versionId: version.id,
                productId: product.id,
                createdBy: targetUserId,
                updatedBy: targetUserId,
              },
            });
          }
        }

        // Add incidents to versions (ensure every version gets at least 0-2 incidents)
        const maxIncidents = Math.min(2, sampleIncidents.length);
        const numIncidents = Math.floor(Math.random() * (maxIncidents + 1));

        if (numIncidents > 0) {
          // Shuffle incidents and take the required number
          const shuffledIncidents = [...sampleIncidents].sort(
            () => Math.random() - 0.5
          );
          const selectedIncidents = shuffledIncidents.slice(0, numIncidents);

          for (const incidentData of selectedIncidents) {
            console.log(
              `Creating incident: ${incidentData.name} for ${productData.name} v${versionString}`
            );

            // Generate reference ID only for incidents that have one in the template
            const incidentReference = incidentData.incidentReference
              ? `${incidentData.incidentReference}-${version.id.slice(-4)}`
              : null;

            await prisma.oscratProductIncident.create({
              data: {
                name: incidentData.name,
                description: incidentData.description,
                type: incidentData.type,
                status: incidentData.status,
                incidentReference: incidentReference,
                versionId: version.id,
                productId: product.id,
                createdBy: targetUserId,
                updatedBy: targetUserId,
              },
            });
          }
        }
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
          teamId: targetTeamId,
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
      `Successfully seeded ${createdProducts.length} products with ${createdVersions.length} versions!`
    );
    console.log('Summary:');
    console.log(`   • Products: ${createdProducts.length}`);
    console.log(`   • Versions: ${createdVersions.length}`);
    console.log(
      `   • CRA Assessments: ${createdVersions.length} (one per version)`
    );

    // Count vulnerabilities and incidents
    const vulnCount = await prisma.oscratProductVulnerability.count({
      where: {
        productId: { in: createdProducts.map((p) => p.id) },
      },
    });

    const incidentCount = await prisma.oscratProductIncident.count({
      where: {
        productId: { in: createdProducts.map((p) => p.id) },
      },
    });

    console.log(`   • Vulnerabilities: ${vulnCount}`);
    console.log(`   • Incidents: ${incidentCount}`);
    console.log(`   • Reporting Organizations: ${createdReportingOrgs.length}`);

    return { createdProducts, createdVersions };
  } catch (error) {
    console.error('Error seeding OSCRAT data:', error);
    throw error;
  }
}

// CLI execution
async function main() {
  const args = process.argv.slice(2);
  const teamSlug = args[0];

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Usage: pnpm tsx prisma/seed-oscrat.ts <organizationId|teamSlug>

Arguments:
  teamSlug                Required. The slug of the team to seed data for.
                          The script will use the team owner as the user for all records.

Examples:
  pnpm tsx prisma/seed-oscrat.ts testtest              # Using team slug
  pnpm run seed:oscrat testtest                        # Using team slug

Options:
  --help, -h      Show this help message

What gets created:
  • Products with multiple versions (1.0.0, 1.1.0, etc.)
  • Version statuses (ACTIVE for latest, DEPRECATED for previous, ARCHIVED for older)
  • CRA assessments for each version
  • Vulnerabilities and incidents associated with versions
  • Reporting organizations with product assignments
    `);
    process.exit(0);
  }

  if (!teamSlug) {
    console.error('Error: Team slug is required.');
    console.log('Usage: pnpm tsx prisma/seed-oscrat.ts <teamSlug>');
    console.log('Run with --help for more information.');
    process.exit(1);
  }

  await seedOscratData(teamSlug);
}

// Export for programmatic use
export { seedOscratData };

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
    .catch((e) => {
      console.error(e);
      console.error(
        'Failed to seed OSCRAT data. Please check the logs for details.'
      );
      process.exit(1);
    })
    .finally(async () => {
      console.log('Seeding completed. Disconnecting from database...');
      await prisma.$disconnect();
    });
}
