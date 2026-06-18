import {
  getRepositoryDetail,
  updateRepository,
  deleteRepository,
} from '@oscrat/model/operations';
import { prisma } from '@/lib/prisma';
import { withTeamAuth, type AuthenticatedTeamRequest } from '@/lib/middleware';
import type { NextApiResponse } from 'next';
import type { OscratRepositoryUpdate } from '@oscrat/model';
import {
  repositoryUpdateSchema,
  generateRepositoryUrl,
  type RepositoryUpdateInput,
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
    case 'PUT':
      return withTeamAuth(['team', 'update'])(handlePUT)(req, res);
    case 'DELETE':
      return withTeamAuth(['team', 'delete'])(handleDELETE)(req, res);
    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      res.status(405).json({
        error: { message: `Method ${method} Not Allowed` },
      });
  }
}

// Get repository detail
const handleGET = async (
  req: AuthenticatedTeamRequest,
  res: NextApiResponse
) => {
  const { teamMember } = req.teamContext;

  const { repositoryId } = req.query;

  const repository = await getRepositoryDetail(
    prisma,
    teamMember.teamId,
    repositoryId as string
  );

  if (!repository) {
    return res.status(404).json({
      error: { message: 'Repository not found' },
    });
  }

  res.status(200).json({ data: repository });
};

// Update repository
const handlePUT = async (
  req: AuthenticatedTeamRequest,
  res: NextApiResponse
) => {
  const { teamMember } = req.teamContext;
  const { repositoryId } = req.query;

  try {
    // Validate complete update data
    const validatedData: RepositoryUpdateInput =
      await repositoryUpdateSchema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true,
      });

    // Build complete update data
    const repositoryData: OscratRepositoryUpdate = {
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

    const repository = await updateRepository(
      prisma,
      teamMember.teamId,
      repositoryId as string,
      repositoryData,
      req.auditInfo
    );

    res.status(200).json({ data: repository });
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

// Delete repository
const handleDELETE = async (
  req: AuthenticatedTeamRequest,
  res: NextApiResponse
) => {
  const { teamMember } = req.teamContext;

  const { repositoryId } = req.query;

  await deleteRepository(
    prisma,
    teamMember.teamId,
    repositoryId as string,
    req.auditInfo
  );

  res.status(200).json({ data: {} });
};
