import type {
  OscratRepositoryProvider,
  OscratRepositoryAuthType,
  Prisma,
} from '@prisma/client';

/** Base repository data */
export interface OscratRepositoryBase {
  name: string;
  provider: OscratRepositoryProvider;
  repositoryUrl: string;
  user: string;
  targetBranch?: string;
  targetTag?: string;
  targetCommit?: string;
  authType: OscratRepositoryAuthType;
  accessToken?: string;
}

/** Repository data for creation */
export interface OscratRepositoryCreate extends OscratRepositoryBase {}

/** Repository data for updates */
export interface OscratRepositoryUpdate extends Partial<OscratRepositoryBase> {}

/** Repository summary view */
export interface OscratRepositorySummary extends OscratRepositoryBase {
  id: string;
  authType: OscratRepositoryAuthType;
  organizationId: string;
  versionId: string;
  productId: string; // Denormalized for easier queries
  createdAt: Date;
  updatedAt: Date;
}

/** Repository detail view */
export interface OscratRepositoryDetail extends OscratRepositorySummary {
  // Same as summary for now, can be extended if needed
}

/** Repository with organization and product for job processing */
export type OscratRepositoryWithRelations = Prisma.OscratRepositoryGetPayload<{
  include: {
    organization: {
      select: {
        id: true;
        name: true;
      };
    };
    version: {
      select: {
        id: true;
        version: true;
        product: {
          select: {
            id: true;
            name: true;
          };
        };
      };
    };
  };
}>;
