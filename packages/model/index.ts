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
} from '@prisma/client';

// Export shared application types (these are safe for client)
export * from './types/assessment';
export * from './types/product';
export * from './types/version';
export * from './types/vulnerabilities';
export * from './types/vulnerabilityScan';
export * from './types/incidents';
export * from './types/repository';
export * from './types/team';
export * from './types/craForm/form';
export * from './types/jobPayloads';
export * from './types/dashboard';

// Export error utilities
export { ERROR_CODES, type ErrorCode } from './constants/errorCodes';

// Export specific operation types needed by frontend
export type {
  SbomReportDetails,
  SbomReportSummary,
} from './operations/sbomReport';
export type {
  VulnerabilityScanReportDetails,
  VulnerabilityScanReportSummary,
} from './operations/vulnerabilityScanReport';
export { VulnerabilityScanSource, SbomSource } from './operations/workerJob';
export type { CreateFileParams, FileData } from './operations/file';
export type {
  AttachmentWithFile,
  CreateAttachmentParams,
} from './operations/attachment';
export type {
  SbomReportScanVulnerabilitiesPayload,
  SbomReportScanVulnerabilitiesResult,
} from './types/jobPayloads';
