import { PrismaClient, type Prisma } from '@prisma/client';
import type {
  OscratRepositoryCreate,
  OscratRepositoryUpdate,
  OscratRepositorySummary,
  OscratRepositoryDetail,
  OscratRepositoryWithRelations,
} from '../types/repository';

/** Include for repository summary queries */
const REPOSITORY_SUMMARY_INCLUDE = {
  team: {
    select: {
      id: true,
      name: true,
    },
  },
  version: {
    select: {
      id: true,
      version: true,
      product: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  },
} as const;

/** Include for repository detail queries */
const REPOSITORY_DETAIL_INCLUDE = {
  team: {
    select: {
      id: true,
      name: true,
    },
  },
  version: {
    select: {
      id: true,
      version: true,
      product: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  },
} as const;

/** Transform Prisma repository to RepositorySummary */
const transformToRepositorySummary = (
  repository: Prisma.OscratRepositoryGetPayload<{
    include: typeof REPOSITORY_SUMMARY_INCLUDE;
  }>
): OscratRepositorySummary => ({
  id: repository.id,
  name: repository.name,
  provider: repository.provider,
  repositoryUrl: repository.repositoryUrl,
  user: repository.user,
  targetBranch: repository.targetBranch || undefined,
  targetTag: repository.targetTag || undefined,
  targetCommit: repository.targetCommit || undefined,
  authType: repository.authType,
  accessToken: repository.accessToken || undefined,
  teamId: repository.teamId,
  versionId: repository.versionId,
  productId: repository.productId,
  createdAt: repository.createdAt,
  updatedAt: repository.updatedAt,
});

/** Transform Prisma repository to RepositoryDetail */
const transformToRepositoryDetail = (
  repository: Prisma.OscratRepositoryGetPayload<{
    include: typeof REPOSITORY_DETAIL_INCLUDE;
  }>
): OscratRepositoryDetail => ({
  id: repository.id,
  name: repository.name,
  provider: repository.provider,
  repositoryUrl: repository.repositoryUrl,
  user: repository.user,
  targetBranch: repository.targetBranch || undefined,
  targetTag: repository.targetTag || undefined,
  targetCommit: repository.targetCommit || undefined,
  authType: repository.authType,
  accessToken: repository.accessToken || undefined,
  teamId: repository.teamId,
  versionId: repository.versionId,
  productId: repository.productId,
  createdAt: repository.createdAt,
  updatedAt: repository.updatedAt,
});

/** Get repository for a specific product version */
export const getVersionRepository = async (
  prisma: PrismaClient,
  teamId: string,
  versionId: string
): Promise<OscratRepositorySummary | null> => {
  const repository = await prisma.oscratRepository.findFirst({
    where: {
      versionId,
      teamId,
    },
    include: REPOSITORY_SUMMARY_INCLUDE,
  });

  return repository ? transformToRepositorySummary(repository) : null;
};

/** Get repository for a specific product (gets the repository from the active version) */
export const getProductRepository = async (
  prisma: PrismaClient,
  teamId: string,
  productId: string
): Promise<OscratRepositorySummary | null> => {
  // Direct query to get the repository from the active version of the product
  const repository = await prisma.oscratRepository.findFirst({
    where: {
      productId,
      teamId,
      version: { status: 'ACTIVE' },
    },
    include: REPOSITORY_SUMMARY_INCLUDE,
    orderBy: {
      version: { createdAt: 'desc' },
    },
  });

  return repository ? transformToRepositorySummary(repository) : null;
};

/** Get detailed information for a specific repository */
export const getRepositoryDetail = async (
  prisma: PrismaClient,
  teamId: string,
  repositoryId: string
): Promise<OscratRepositoryDetail | null> => {
  const repository = await prisma.oscratRepository.findFirst({
    where: {
      id: repositoryId,
      teamId,
    },
    include: REPOSITORY_DETAIL_INCLUDE,
  });

  return repository ? transformToRepositoryDetail(repository) : null;
};

/** Get repository by ID (for job processing) */
export const getRepositoryById = async (
  prisma: PrismaClient,
  repositoryId: string
): Promise<OscratRepositoryWithRelations | null> => {
  return await prisma.oscratRepository.findUnique({
    where: { id: repositoryId },
    include: {
      team: {
        select: {
          id: true,
          name: true,
        },
      },
      version: {
        select: {
          id: true,
          version: true,
          product: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });
};

/** Create a new repository for a product version */
export const createRepository = async (
  prisma: PrismaClient,
  teamId: string,
  versionId: string,
  data: OscratRepositoryCreate
): Promise<OscratRepositoryDetail> => {
  console.log(
    `[Repository Operations] Creating repository for team: ${teamId}, version: ${versionId}`
  );
  console.log(`[Repository Operations] Repository data:`, {
    name: data.name,
    provider: data.provider,
    repositoryUrl: data.repositoryUrl,
    user: data.user,
    authType: data.authType,
    hasAccessToken: !!data.accessToken,
  });

  // Verify version exists and belongs to team, and get organization and product info
  const version = await prisma.oscratProductVersion.findFirst({
    where: {
      id: versionId,
      product: {
        teamId,
      },
    },
    include: {
      product: {
        select: {
          id: true,
          teamId: true,
        },
      },
    },
  });

  console.log(`[Repository Operations] Version found:`, version ? 'Yes' : 'No');
  if (version) {
    console.log(`[Repository Operations] Version details:`, {
      id: version.id,
      version: version.version,
      productId: version.product.id,
      teamId: version.product.teamId,
    });
  }

  if (!version) {
    console.error(
      `[Repository Operations] Version ${versionId} not found for team: ${teamId}`
    );
    throw new Error(`Version ${versionId} not found for team: ${teamId}`);
  }

  // Check if version already has a repository
  const existingRepository = await prisma.oscratRepository.findFirst({
    where: { versionId },
    select: { id: true },
  });

  if (existingRepository) {
    console.error(
      `[Repository Operations] Version ${versionId} already has a repository with ID: ${existingRepository.id}`
    );
    throw new Error(`Version ${versionId} already has a repository`);
  }

  console.log(`[Repository Operations] Creating repository in database...`);

  // Create the repository
  const repository = await prisma.oscratRepository.create({
    data: {
      name: data.name,
      provider: data.provider,
      repositoryUrl: data.repositoryUrl,
      user: data.user,
      targetBranch: data.targetBranch,
      targetTag: data.targetTag,
      targetCommit: data.targetCommit,
      authType: data.authType,
      accessToken: data.accessToken,
      teamId: teamId,
      versionId: versionId,
      productId: version.product.id,
    },
    include: REPOSITORY_DETAIL_INCLUDE,
  });

  console.log(`[Repository Operations] Repository created successfully:`, {
    id: repository.id,
    name: repository.name,
    provider: repository.provider,
    teamId: repository.teamId,
    versionId: repository.versionId,
  });

  return transformToRepositoryDetail(repository);
};

/** Update an existing repository */
export const updateRepository = async (
  prisma: PrismaClient,
  teamId: string,
  repositoryId: string,
  data: OscratRepositoryUpdate
): Promise<OscratRepositoryDetail> => {
  // Verify repository ownership first
  const repository = await prisma.oscratRepository.findFirst({
    where: {
      id: repositoryId,
      teamId,
    },
    select: { id: true },
  });

  if (!repository) {
    throw new Error(`Repository ${repositoryId} not found for team: ${teamId}`);
  }

  // Update the repository
  const updatedRepository = await prisma.oscratRepository.update({
    where: { id: repositoryId },
    data: {
      name: data.name,
      provider: data.provider,
      repositoryUrl: data.repositoryUrl,
      user: data.user,
      targetBranch: data.targetBranch,
      targetTag: data.targetTag,
      targetCommit: data.targetCommit,
      authType: data.authType,
      accessToken: data.accessToken,
    },
    include: REPOSITORY_DETAIL_INCLUDE,
  });

  return transformToRepositoryDetail(updatedRepository);
};

/** Delete a repository */
export const deleteRepository = async (
  prisma: PrismaClient,
  teamId: string,
  repositoryId: string
): Promise<void> => {
  // Verify repository ownership first
  const repository = await prisma.oscratRepository.findFirst({
    where: {
      id: repositoryId,
      teamId,
    },
    select: { id: true },
  });

  if (!repository) {
    throw new Error(`Repository ${repositoryId} not found for team: ${teamId}`);
  }

  // Delete the repository
  await prisma.oscratRepository.delete({
    where: { id: repositoryId },
  });
};

/** Create repository for a product by creating it on the active version */
export const createProductRepository = async (
  prisma: PrismaClient,
  teamId: string,
  productId: string,
  data: OscratRepositoryCreate
): Promise<OscratRepositoryDetail> => {
  // Find the active version of the product
  const product = await prisma.oscratProduct.findFirst({
    where: {
      id: productId,
      teamId,
    },
    include: {
      versions: {
        where: { status: 'ACTIVE' },
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
  });

  if (!product) {
    throw new Error(`Product ${productId} not found for team: ${teamId}`);
  }

  const activeVersion = product.versions[0];
  if (!activeVersion) {
    throw new Error(`No active version found for product ${productId}`);
  }

  return createRepository(prisma, teamId, activeVersion.id, data);
};
