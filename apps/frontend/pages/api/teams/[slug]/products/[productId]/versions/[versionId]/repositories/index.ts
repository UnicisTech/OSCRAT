import {
  getVersionRepository,
  createRepository,
} from '@oscrat/model/operations';
import { prisma } from '@/lib/prisma';
import { withTeamAuth, type AuthenticatedTeamRequest } from '@/lib/middleware';
import type { NextApiResponse } from 'next';
import type { OscratRepositoryCreate } from '@oscrat/model';
import { OscratRepositoryAuthType } from '@oscrat/model';
import { ApiError } from '@/lib/errors';
import {
  repositoryCreateSchema,
  generateRepositoryUrl,
  type RepositoryCreateInput,
} from '@/lib/validation/repository';
import * as Yup from 'yup';

export default function handler(
  req: AuthenticatedTeamRequest,
  res: NextApiResponse
) {
  const { method } = req;

  switch (method) {
    case 'GET':
      return withTeamAuth(['team', 'read'])(handleGET)(req, res);
    case 'POST':
      return withTeamAuth(['team', 'create'])(handlePOST)(req, res);
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      throw new ApiError(405, `Method ${method} Not Allowed`);
  }
}

// Get repository for a version
const handleGET = async (
  req: AuthenticatedTeamRequest,
  res: NextApiResponse
) => {
  const { teamMember } = req.teamContext;

  const { versionId } = req.query;

  const repository = await getVersionRepository(
    prisma,
    teamMember.teamId,
    versionId as string
  );

  console.log(
    `[Repository API] Repository ${repository ? 'found' : 'not found'} for version ${versionId}`
  );

  res.status(200).json({ data: repository });
};

// Create a new repository
const handlePOST = async (
  req: AuthenticatedTeamRequest,
  res: NextApiResponse
) => {
  const { teamMember } = req.teamContext;
  const { versionId } = req.query;

  try {
    // Validate and get typed data
    const validatedData: RepositoryCreateInput =
      await repositoryCreateSchema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true,
      });

    // Build repository data for database
    const repositoryData: OscratRepositoryCreate = {
      name: validatedData.name,
      provider: validatedData.provider,
      user: validatedData.user,
      repositoryUrl: generateRepositoryUrl(
        validatedData.provider,
        validatedData.user,
        validatedData.name
      ),
      authType: validatedData.authType,
      accessToken: validatedData.accessToken,
      targetBranch: validatedData.targetBranch,
      targetTag: validatedData.targetTag,
      targetCommit: validatedData.targetCommit,
    };

    const repository = await createRepository(
      prisma,
      teamMember.teamId,
      versionId as string,
      repositoryData
    );

    console.log(
      `[OSCRAT] repository created, repositoryId: ${repository.id}, name: ${repositoryData.name}, versionId: ${versionId}`
    );

    res.status(201).json({ data: repository });
  } catch (error) {
    if (error instanceof Yup.ValidationError) {
      const errors = error.inner.reduce((acc: Record<string, string>, err) => {
        if (err.path) {
          acc[err.path] = err.message;
        }
        return acc;
      }, {});

      return res.status(400).json({
        error: {
          message: 'Validation failed',
          fields: errors,
        },
      });
    }

    throw error;
  }
};
