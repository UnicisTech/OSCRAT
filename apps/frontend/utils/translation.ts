// OSCRAT Translation Mappings
// Maps enum values from Prisma schema to translation keys

// Organization Role mappings
export const oscratOrganizationRoleTranslationMap = {
  MANUFACTURER: 'oscrat.organization.roles.manufacturer',
  DISTRIBUTOR: 'oscrat.organization.roles.distributor',
  IMPORTER: 'oscrat.organization.roles.importer',
  DATA_STEWARD: 'oscrat.organization.roles.data-steward',
} as const;

// Organization Type mappings
export const oscratOrganizationTypeTranslationMap = {
  NATURAL_PERSON: 'oscrat.organization.types.natural-person',
  LIMITED_LIABILITY_COMPANY:
    'oscrat.organization.types.limited-liability-company',
  PUBLIC_LIMITED_COMPANY: 'oscrat.organization.types.public-limited-company',
  PARTNERSHIP: 'oscrat.organization.types.partnership',
  OPEN_SOURCE_FOUNDATION: 'oscrat.organization.types.open-source-foundation',
  OPEN_SOURCE_STEWARD: 'oscrat.organization.types.open-source-steward',
  NON_PROFIT_ORGANIZATION: 'oscrat.organization.types.non-profit-organization',
  ACADEMIC_INSTITUTION: 'oscrat.organization.types.academic-institution',
  PUBLIC_BODY: 'oscrat.organization.types.public-body',
  OTHER: 'oscrat.organization.types.other',
} as const;

// Organization Size mappings
export const oscratOrganizationSizeTranslationMap = {
  MICRO_ENTERPRISE: 'oscrat.organization.sizes.micro-enterprise',
  SMALL_ENTERPRISE: 'oscrat.organization.sizes.small-enterprise',
  MEDIUM_ENTERPRISE: 'oscrat.organization.sizes.medium-enterprise',
  OTHER: 'oscrat.organization.sizes.other',
} as const;

// Product Category mappings
export const oscratProductCategoryTranslationMap = {
  DEFAULT: 'oscrat.product.categories.default',
  IMPORTANT_CLASS_I: 'oscrat.product.categories.important-class-i',
  IMPORTANT_CLASS_II: 'oscrat.product.categories.important-class-ii',
  CRITICAL: 'oscrat.product.categories.critical',
} as const;

// Product Type mappings
export const oscratProductTypeTranslationMap = {
  CONNECTED_DEVICE: 'oscrat.product.types.connected-device',
  IOT_DEVICE: 'oscrat.product.types.iot-device',
  SMART_HOME_DEVICE: 'oscrat.product.types.smart-home-device',
  WEARABLE_DEVICE: 'oscrat.product.types.wearable-device',
  INDUSTRIAL_DEVICE: 'oscrat.product.types.industrial-device',
  SECURITY_HARDWARE: 'oscrat.product.types.security-hardware',
  APPLICATION_SOFTWARE: 'oscrat.product.types.application-software',
  SYSTEM_SOFTWARE: 'oscrat.product.types.system-software',
  SECURITY_SOFTWARE: 'oscrat.product.types.security-software',
  EMBEDDED_SOFTWARE: 'oscrat.product.types.embedded-software',
  FIRMWARE: 'oscrat.product.types.firmware',
  HARDWARE_WITH_SOFTWARE: 'oscrat.product.types.hardware-with-software',
  REMOTE_DATA_PROCESSING: 'oscrat.product.types.remote-data-processing',
} as const;

// Product Status mappings
export const oscratProductStatusTranslationMap = {
  ACTIVE: 'oscrat.product.status.active',
  INACTIVE: 'oscrat.product.status.inactive',
} as const;

// Product Version Status mappings
export const oscratProductVersionStatusTranslationMap = {
  DRAFT: 'oscrat.ui.draft',
  ACTIVE: 'oscrat.ui.supported',
  DEPRECATED: 'oscrat.ui.not-supported',
  ARCHIVED: 'oscrat.ui.archived',
  WITHDRAWN: 'oscrat.ui.withdrawn',
  SUPPORTED: 'oscrat.ui.doc.ready-for-market',
} as const;

// Risk Level mappings
export const oscratRiskLevelTranslationMap = {
  LOW: 'oscrat.risk.levels.low',
  MEDIUM: 'oscrat.risk.levels.medium',
  HIGH: 'oscrat.risk.levels.high',
  CRITICAL: 'oscrat.risk.levels.critical',
} as const;

// Compliance Status mappings (product-level)
export const oscratComplianceStatusTranslationMap = {
  NOT_ASSESSED: 'oscrat.compliance.status.not-assessed',
  IN_PROGRESS: 'oscrat.compliance.status.in-progress',
  COMPLIANT: 'oscrat.compliance.status.compliant',
  NON_COMPLIANT: 'oscrat.compliance.status.non-compliant',
  PENDING_CERTIFICATION: 'oscrat.compliance.status.pending-certification',
  CERTIFIED: 'oscrat.compliance.status.certified',
} as const;

// Conformity Procedure mappings
export const oscratConformityProcedureTranslationMap = {
  SELF_ASSESSMENT: 'oscrat.conformity.procedures.self-assessment',
  THIRD_PARTY_OPTIONAL: 'oscrat.conformity.procedures.third-party-optional',
  THIRD_PARTY_MANDATORY: 'oscrat.conformity.procedures.third-party-mandatory',
  EUCC_CERTIFICATION: 'oscrat.conformity.procedures.eucc-certification',
} as const;

// Vulnerability Severity mappings
export const oscratVulnerabilitySeverityTranslationMap = {
  LOW: 'oscrat.vulnerability.severity.low',
  MEDIUM: 'oscrat.vulnerability.severity.medium',
  HIGH: 'oscrat.vulnerability.severity.high',
  CRITICAL: 'oscrat.vulnerability.severity.critical',
} as const;

// Vulnerability Status mappings
export const oscratVulnerabilityStatusTranslationMap = {
  OPEN: 'oscrat.vulnerability.status.open',
  ACTIVELY_EXPLOITED: 'oscrat.vulnerability.status.actively-exploited',
  PATCHED: 'oscrat.vulnerability.status.patched',
  MITIGATED: 'oscrat.vulnerability.status.mitigated',
  CLOSED: 'oscrat.vulnerability.status.closed',
  ACCEPTED_RISK: 'oscrat.vulnerability.status.accepted-risk',
} as const;

// Incident Type mappings
export const oscratIncidentTypeTranslationMap = {
  VULNERABILITY_EXPLOIT: 'oscrat.incident.types.vulnerability-exploit',
  PRODUCT_COMPROMISE: 'oscrat.incident.types.product-compromise',
  SUPPLY_CHAIN_INCIDENT: 'oscrat.incident.types.supply-chain-incident',
  AUTHENTICATION_BYPASS: 'oscrat.incident.types.authentication-bypass',
  DATA_BREACH: 'oscrat.incident.types.data-breach',
  DENIAL_OF_SERVICE: 'oscrat.incident.types.denial-of-service',
  FIRMWARE_TAMPERING: 'oscrat.incident.types.firmware-tampering',
  CONFIGURATION_EXPLOIT: 'oscrat.incident.types.configuration-exploit',
  UPDATE_MECHANISM_FAILURE: 'oscrat.incident.types.update-mechanism-failure',
  CRYPTOGRAPHIC_FAILURE: 'oscrat.incident.types.cryptographic-failure',
  NETWORK_INTRUSION: 'oscrat.incident.types.network-intrusion',
  OTHER: 'oscrat.incident.types.other',
} as const;

// Incident Status mappings
export const oscratIncidentStatusTranslationMap = {
  NOT_REPORTED: 'oscrat.incident.status.not-reported',
  INITIAL_ALERT_SENT: 'oscrat.incident.status.initial-alert-sent',
  DETAILED_REPORT_SENT: 'oscrat.incident.status.detailed-report-sent',
  FINAL_REPORT_SENT: 'oscrat.incident.status.final-report-sent',
  REPORTING_COMPLETE: 'oscrat.incident.status.reporting-complete',
} as const;

// Helper functions to get translation keys
export const getOrgRoleKey = (
  role: keyof typeof oscratOrganizationRoleTranslationMap
) => oscratOrganizationRoleTranslationMap[role];

export const getOrgTypeKey = (
  type: keyof typeof oscratOrganizationTypeTranslationMap
) => oscratOrganizationTypeTranslationMap[type];

export const getOrgSizeKey = (
  size: keyof typeof oscratOrganizationSizeTranslationMap
) => oscratOrganizationSizeTranslationMap[size];

export const getProductCategoryKey = (
  category: keyof typeof oscratProductCategoryTranslationMap
) => oscratProductCategoryTranslationMap[category];

export const getProductTypeKey = (
  type: keyof typeof oscratProductTypeTranslationMap
) => oscratProductTypeTranslationMap[type];

export const getProductStatusKey = (
  status: keyof typeof oscratProductStatusTranslationMap
) => oscratProductStatusTranslationMap[status];

export const getRiskLevelKey = (
  level: keyof typeof oscratRiskLevelTranslationMap
) => oscratRiskLevelTranslationMap[level];

export const getComplianceStatusKey = (
  status: keyof typeof oscratComplianceStatusTranslationMap
) => oscratComplianceStatusTranslationMap[status];

export const getConformityProcedureKey = (
  procedure: keyof typeof oscratConformityProcedureTranslationMap
) => oscratConformityProcedureTranslationMap[procedure];

export const getVulnSeverityKey = (
  severity: keyof typeof oscratVulnerabilitySeverityTranslationMap
) => oscratVulnerabilitySeverityTranslationMap[severity];

export const getVulnStatusKey = (
  status: keyof typeof oscratVulnerabilityStatusTranslationMap
) => oscratVulnerabilityStatusTranslationMap[status];

export const getIncidentTypeKey = (
  type: keyof typeof oscratIncidentTypeTranslationMap
) => oscratIncidentTypeTranslationMap[type];

export const getIncidentStatusKey = (
  status: keyof typeof oscratIncidentStatusTranslationMap
) => oscratIncidentStatusTranslationMap[status];

export const getProductVersionStatusKey = (
  status: keyof typeof oscratProductVersionStatusTranslationMap
) => oscratProductVersionStatusTranslationMap[status];

export const getAuditActionTranslationKey = (action: string): string => {
  return `oscrat.audit.actions.${action}`;
};
