import { $ } from 'zx';
import * as path from 'path';
import * as fs from 'fs';
import { OscratRepositoryProvider } from '@oscrat/model';
import type { OscratRepositoryWithRelations } from '@oscrat/model/types/repository';

function getAuthenticatedCloneUrl(
  repository: OscratRepositoryWithRelations
): string {
  const { provider, user, name, accessToken } = repository;

  console.log(
    `[Git Utils] Generating authenticated clone URL for ${provider} repository: ${user}/${name}`
  );

  if (!accessToken) {
    console.error(
      `[Git Utils] Access token is missing for repository: ${user}/${name}`
    );
    throw new Error('Access token is required for repository cloning');
  }

  console.log(
    `[Git Utils] Access token present: ${accessToken ? 'Yes' : 'No'}`
  );

  switch (provider) {
    case OscratRepositoryProvider.GITHUB:
      console.log(`[Git Utils] Using GitHub authentication format`);
      return `https://x-access-token:${accessToken}@github.com/${user}/${name}.git`;

    case OscratRepositoryProvider.GITLAB:
      console.log(`[Git Utils] Using GitLab authentication format`);
      return `https://oauth2:${accessToken}@gitlab.com/${user}/${name}.git`;

    case OscratRepositoryProvider.BITBUCKET:
      console.log(`[Git Utils] Using Bitbucket authentication format`);
      return `https://x-token-auth:${accessToken}@bitbucket.org/${user}/${name}.git`;

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
  const originalCwd = $.cwd;

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

    // Set working directory for git operations
    console.log(`[Git Utils] Setting working directory to: ${tempDir}`);
    $.cwd = tempDir;

    // Clone the repository
    console.log(`[Git Utils] Executing git clone command...`);
    await $`git clone ${cloneUrl} ${repository.name}`;
    console.log(`[Git Utils] Repository cloned successfully`);

    // Change to the repository directory
    console.log(`[Git Utils] Changing to repository directory: ${repoPath}`);
    $.cwd = repoPath;

    // Checkout specific reference if specified
    if (targetRef) {
      console.log(`[Git Utils] Checking out specific reference: ${targetRef}`);

      // Fetch all references to ensure we have the target
      console.log(`[Git Utils] Fetching all references...`);
      await $`git fetch --all --tags`;

      // Checkout the target reference
      console.log(`[Git Utils] Checking out target reference: ${targetRef}`);
      await $`git checkout ${targetRef}`;
    } else {
      console.log(
        `[Git Utils] No specific reference to checkout, using default branch`
      );
    }

    // Verify the checkout
    console.log(`[Git Utils] Verifying checkout...`);
    const currentRef = (await $`git rev-parse HEAD`).stdout.trim();
    const currentBranch = (await $`git branch --show-current`).stdout.trim();

    console.log(`[Git Utils] Repository clone completed successfully:`, {
      repoPath,
      currentCommit: currentRef,
      currentBranch: currentBranch || 'detached HEAD',
    });

    return repoPath;
  } catch (error: any) {
    console.error(`[Git Utils] Failed to clone repository:`, {
      repository: `${repository.user}/${repository.name}`,
      error: error.message,
      stack: error.stack,
      repoPath,
      tempDir,
    });
    throw new Error('Failed to clone repository');
  } finally {
    console.log(`[Git Utils] Resetting working directory to: ${originalCwd}`);
    $.cwd = originalCwd;
  }
}
