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
export type OscratRepositoryCreate = OscratRepositoryBase;

/** Repository data for updates */
export type OscratRepositoryUpdate = Partial<OscratRepositoryBase>;

/** Repository summary view */
export interface OscratRepositorySummary extends OscratRepositoryBase {
  id: string;
  authType: OscratRepositoryAuthType;
  teamId: string;
  versionId: string;
  productId: string; // Denormalized for easier queries
  createdAt: Date;
  updatedAt: Date;
}

/** Repository detail view */
export type OscratRepositoryDetail = OscratRepositorySummary;

/** Repository with team and product for job processing */
export type OscratRepositoryWithRelations = Prisma.OscratRepositoryGetPayload<{
  include: {
    team: {
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
