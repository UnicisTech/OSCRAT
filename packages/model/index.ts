// Client-safe exports (types and enums, but no PrismaClient)
// Export specific types we need, excluding Team to avoid conflicts
export type {
  User,
  ApiKey,
  Invitation,
  Task,
  Comment,
  Attachment,
  TeamMember,
  WorkerJob,
  VerificationToken,
  Prisma,
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
  OscratProductIncidentType,
  OscratProductIncidentStatus,
  OscratRepositoryProvider,
  OscratRepositoryAuthType,
  WorkerJobType,
  WorkerJobStatus,
} from '@prisma/client';

// Export shared application types (these are safe for client)
export * from './types/assessment';
export * from './types/organisation';
export * from './types/product';
export * from './types/version';
export * from './types/vulnerabilities';
export * from './types/incidents';
export * from './types/repository';
export * from './types/team';
export * from './types/craForm/form';
export * from './types/jobPayloads';
