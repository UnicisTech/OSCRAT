import { $ } from 'zx';
import * as path from 'path';
import * as fs from 'fs';
import { OscratRepositoryProvider } from '@oscrat/model';
import { decryptToken } from '@oscrat/model/operations';
import type { OscratRepositoryWithRelations } from '@oscrat/model/types/repository';
import { ERROR_CODES } from '@oscrat/model/constants/errorCodes';
import { translateError } from './errorTranslator';

function getAuthenticatedCloneUrl(
  repository: OscratRepositoryWithRelations
): string {
  const { provider, user, name, accessToken, authType } = repository;

  console.log(
    `[Git Utils] Generating authenticated clone URL for ${provider} repository: ${user}/${name} (auth: ${authType})`
  );

  // For public repositories, return standard HTTPS URL without authentication
  if (authType === 'PUBLIC' || !accessToken) {
    console.log(`[Git Utils] Using public repository URL (no authentication)`);
    switch (provider) {
      case OscratRepositoryProvider.GITHUB:
        return `https://github.com/${user}/${name}.git`;
      case OscratRepositoryProvider.GITLAB:
        return `https://gitlab.com/${user}/${name}.git`;
      case OscratRepositoryProvider.BITBUCKET:
        return `https://bitbucket.org/${user}/${name}.git`;
      default:
        console.error(`[Git Utils] Unsupported repository provider: ${provider}`);
        throw new Error(`Unsupported repository provider: ${provider}`);
    }
  }

  const token = decryptToken(accessToken);
  console.log(`[Git Utils] Token decrypted successfully`);

  switch (provider) {
    case OscratRepositoryProvider.GITHUB:
      console.log(`[Git Utils] Using GitHub authentication format`);
      return `https://x-access-token:${token}@github.com/${user}/${name}.git`;

    case OscratRepositoryProvider.GITLAB:
      console.log(`[Git Utils] Using GitLab authentication format`);
      return `https://oauth2:${token}@gitlab.com/${user}/${name}.git`;

    case OscratRepositoryProvider.BITBUCKET:
      console.log(`[Git Utils] Using Bitbucket authentication format`);
      return `https://x-token-auth:${token}@bitbucket.org/${user}/${name}.git`;

    default:
      console.error(`[Git Utils] Unsupported repository provider: ${provider}`);
      throw new Error(`Unsupported repository provider: ${provider}`);
  }
}

function getTargetReference(
  repository: OscratRepositoryWithRelations
): string | null {
  const { targetCommit, targetTag, targetBranch } = repository;

  console.log(`[Git Utils] Determining target reference:`, {
    targetCommit,
    targetTag,
    targetBranch,
  });

  // Priority: commit > tag > target branch
  if (targetCommit) {
    console.log(`[Git Utils] Using target commit: ${targetCommit}`);
    return targetCommit;
  }
  if (targetTag) {
    console.log(`[Git Utils] Using target tag: ${targetTag}`);
    return targetTag;
  }
  if (targetBranch) {
    console.log(`[Git Utils] Using target branch: ${targetBranch}`);
    return targetBranch;
  }

  console.log(`[Git Utils] No target reference specified, using default`);
  return null; // No default branch anymore
}

export async function cloneRepository(
  repository: OscratRepositoryWithRelations,
  tempDir: string
): Promise<string> {
  console.log(`[Git Utils] Starting repository clone process:`, {
    repositoryName: `${repository.user}/${repository.name}`,
    provider: repository.provider,
    tempDir: tempDir,
    repositoryUrl: repository.repositoryUrl,
  });

  const cloneUrl = getAuthenticatedCloneUrl(repository);
  const targetRef = getTargetReference(repository);
  const repoPath = path.join(tempDir, repository.name);

  console.log(`[Git Utils] Clone configuration:`, {
    repoPath,
    targetRef,
    hasCloneUrl: !!cloneUrl,
  });

  try {
    // Remove existing directory if it exists
    if (fs.existsSync(repoPath)) {
      console.log(
        `[Git Utils] Removing existing repository directory: ${repoPath}`
      );
      fs.rmSync(repoPath, { recursive: true, force: true });
    }

    console.log(
      `[Git Utils] Cloning repository ${repository.user}/${repository.name} to ${repoPath}`
    );

    // Clone the repository to the target path
    console.log(`[Git Utils] Executing git clone command...`);
    await $`git clone ${cloneUrl} ${repoPath}`;
    console.log(`[Git Utils] Repository cloned successfully`);

    // Create isolated $ instance for git operations in the repo directory
    const $$ = $({ cwd: repoPath });

    // Checkout specific reference if specified
    if (targetRef) {
      console.log(`[Git Utils] Checking out specific reference: ${targetRef}`);

      // Fetch all references to ensure we have the target
      console.log(`[Git Utils] Fetching all references...`);
      await $$`git fetch --all --tags`;

      // Checkout the target reference
      console.log(`[Git Utils] Checking out target reference: ${targetRef}`);
      await $$`git checkout ${targetRef}`;
    } else {
      console.log(
        `[Git Utils] No specific reference to checkout, using default branch`
      );
    }

    // Verify the checkout
    console.log(`[Git Utils] Verifying checkout...`);
    const currentRef = (await $$`git rev-parse HEAD`).stdout.trim();
    const currentBranch = (await $$`git branch --show-current`).stdout.trim();

    console.log(`[Git Utils] Repository clone completed successfully:`, {
      repoPath,
      currentCommit: currentRef,
      currentBranch: currentBranch || 'detached HEAD',
    });

    return repoPath;
  } catch (error: any) {
    const jobError = translateError(
      'Git Utils',
      error,
      ERROR_CODES.REPOSITORY_OPERATION_FAILED,
      `Failed to clone repository: ${repository.user}/${repository.name}`
    );

    console.error(`[Git Utils] Repository clone context:`, {
      repository: `${repository.user}/${repository.name}`,
      repoPath,
      tempDir,
    });

    throw jobError;
  }
}
