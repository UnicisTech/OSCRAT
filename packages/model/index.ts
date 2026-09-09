// Client-safe exports (types and enums, but no PrismaClient)
// Export specific types we need, excluding Team to avoid conflicts
export type {
  User,
  ApiKey,
  Invitation,
  Comment,
  File,
  Attachment,
  TeamMember,
  WorkerJob,
  VerificationToken,
  Prisma,
  Task,
  // Exclude Team - we use our own Team types
} from '@prisma/client';

// Export enums and other client-safe runtime values
export {
  Role,
  OscratOrganizationRole,
  OscratOrganizationType,
  OscratOrganizationSize,
  OscratProductCategory,
  OscratProductRiskLevel,
  OscratProductComplianceStatus,
  OscratProductType,
  OscratProductStatus,
  OscratProductVersionStatus,
  OscratConformityProcedure,
  OscratAssessmentType,
  OscratProductVulnerabilitySeverity,
  OscratProductVulnerabilityStatus,
  IncidentStatus,
  IncidentClassification,
  IncidentAttackType,
  IncidentSeverity,
  OscratRepositoryProvider,
  OscratRepositoryAuthType,
  WorkerJobType,
  WorkerJobStatus,
  TaskStatus,
  TaskOriginType,
  TaskType,
  AuditUserType,
  DocumentationVisibility,
  DocumentationStatus,
  ConfigurationScanFormat,
} from '@prisma/client';

// Export shared application types (these are safe for client)
export * from './types/assessment';
export * from './types/product';
export * from './types/version';
export * from './types/vulnerabilities';
export * from './types/vulnerabilityScan';
export * from './types/configurationScan';
export * from './types/incidents';
export * from './types/repository';
export * from './types/team';
export * from './types/craForm/form';
export * from './types/jobPayloads';
export * from './types/dashboard';
export * from './types/auditLog';
export * from './types/documentation';
export * from './types/task';

// Export error utilities
export { ERROR_CODES, type ErrorCode } from './constants/errorCodes';

export * from './audit';

// Export vulnerability constants for fronten
export { OPEN_VULNERABILITY_STATUSES } from './constants/vulnerability';

export {
  AWARENESS_TRAINING_DUE_DAYS,
  AWARENESS_TRAINING_REGENERATION_DAYS,
  AWARENESS_TRAINING_TITLE_LOC_ID,
  AWARENESS_TRAINING_DESCRIPTION_LOC_ID,
} from './constants/awarenessTraining';
export {
  CONFIGURATION_TASK_DUE_DAYS,
  CONFIGURATION_TASK_TITLE_LOC_ID,
  CONFIGURATION_TASK_DESCRIPTION_LOC_ID,
  CONFIGURATION_TASK_RULE_DESCRIPTION_MAX,
} from './constants/configurationTask';

// Export specific operation types needed by frontend
export type {
  SbomReportDetails,
  SbomReportSummary,
} from './operations/sbomReport';
export type {
  VulnerabilityScanReportDetails,
  VulnerabilityScanReportSummary,
} from './operations/vulnerabilityScanReport';
export type {
  ConfigurationScanReportDetails,
  ConfigurationScanReportSummary,
} from './operations/configurationScanReport';
export { VulnerabilityScanSource, SbomSource } from './operations/workerJob';
export type { CreateFileParams, FileData } from './operations/file';
export type {
  AttachmentWithFile,
  CreateAttachmentParams,
} from './operations/attachment';
export {
  repoGenerateSbomPayloadSchema,
  fileImportSbomPayloadSchema,
  repoScanVulnerabilitiesPayloadSchema,
  sbomReportScanVulnerabilitiesPayloadSchema,
  processConfigurationScanPayloadSchema,
} from './schemas/jobPayloads';
