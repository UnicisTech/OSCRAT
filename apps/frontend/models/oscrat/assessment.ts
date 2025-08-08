import { prisma } from '@/lib/prisma';
import type { Prisma } from '@oscrat/model';
import type {
  OscratAssessmentCreate,
  OscratAssessmentSummary,
  OscratAssessmentDetail,
} from '@oscrat/model';
import {
  transformToAssessmentSummary,
  transformToAssessmentDetail,
} from './shared';

/** Select for assessment summary queries */
const ASSESSMENT_SUMMARY_SELECT = {
  id: true,
  type: true,
  schemaVersion: true,
  versionId: true,
  productId: true,
  createdAt: true,
  createdBy: true,
} as const;

/** Select for assessment detail queries */
const ASSESSMENT_DETAIL_SELECT = {
  id: true,
  type: true,
  schemaVersion: true,
  rawData: true,
  versionId: true,
  productId: true,
  createdAt: true,
  createdBy: true,
} as const;

/** Get all assessments for a specific project */
export const getAssessments = async (
  teamId: string,
  projectId: string
): Promise<OscratAssessmentSummary[]> => {
  // Verify project ownership first
  const team = await prisma.team.findUnique({
    where: { id: teamId },
    include: {
      products: {
        where: { id: projectId },
        select: { id: true }, // Only need to verify existence
      },
    },
  });

  if (!team || team.products.length === 0) {
    throw new Error(`Project ${projectId} not found for team: ${teamId}`);
  }

  const assessments = await prisma.oscratProductAssessment.findMany({
    where: { productId: projectId },
    select: ASSESSMENT_SUMMARY_SELECT,
    orderBy: { createdAt: 'desc' },
  });

  return assessments.map(transformToAssessmentSummary);
};

/** Get detailed information for a specific assessment */
export const getAssessmentDetail = async (
  teamId: string,
  projectId: string,
  assessmentId: string
): Promise<OscratAssessmentDetail | null> => {
  // Verify project ownership first
  const team = await prisma.team.findUnique({
    where: { id: teamId },
    include: {
      products: {
        where: { id: projectId },
        select: { id: true }, // Only need to verify existence
      },
    },
  });

  if (!team || team.products.length === 0) {
    throw new Error(`Project ${projectId} not found for team: ${teamId}`);
  }

  const assessment = await prisma.oscratProductAssessment.findFirst({
    where: {
      id: assessmentId,
      productId: projectId,
    },
    select: ASSESSMENT_DETAIL_SELECT,
  });

  return assessment ? transformToAssessmentDetail(assessment) : null;
};

/** Create a new assessment for a project */
export const createAssessment = async (
  teamId: string,
  projectId: string,
  data: OscratAssessmentCreate
): Promise<OscratAssessmentDetail> => {
  // Verify project ownership and find active version
  const team = await prisma.team.findUnique({
    where: { id: teamId },
    include: {
      products: {
        where: { id: projectId },
        include: {
          versions: {
            where: { status: 'ACTIVE' },
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      },
    },
  });

  if (!team || team.products.length === 0) {
    throw new Error(`Project ${projectId} not found for team: ${teamId}`);
  }

  const product = team.products[0];
  const activeVersion = product.versions[0];

  if (!activeVersion) {
    throw new Error(`No active version found for project ${projectId}`);
  }

  const assessment = await prisma.oscratProductAssessment.create({
    data: {
      type: data.type,
      schemaVersion: data.schemaVersion,
      rawData: data.rawData as Prisma.InputJsonValue,
      versionId: activeVersion.id,
      productId: projectId,
      createdBy: data.createdBy,
    },
    select: ASSESSMENT_DETAIL_SELECT,
  });

  return transformToAssessmentDetail(assessment);
};

/** Delete an assessment */
export const deleteAssessment = async (
  teamId: string,
  projectId: string,
  assessmentId: string
): Promise<void> => {
  // Verify project ownership first
  const team = await prisma.team.findUnique({
    where: { id: teamId },
    include: {
      products: {
        where: { id: projectId },
        select: { id: true }, // Only need to verify existence
      },
    },
  });

  if (!team || team.products.length === 0) {
    throw new Error(`Project ${projectId} not found for team: ${teamId}`);
  }

  // Verify assessment exists and belongs to this project
  const assessment = await prisma.oscratProductAssessment.findFirst({
    where: {
      id: assessmentId,
      productId: projectId,
    },
    select: { id: true },
  });

  if (!assessment) {
    throw new Error(
      `Assessment ${assessmentId} not found for project ${projectId}`
    );
  }

  // Delete the assessment
  await prisma.oscratProductAssessment.delete({
    where: { id: assessmentId },
  });
};

/** Get all assessments for a specific project version */
export const getVersionAssessments = async (
  teamId: string,
  versionId: string
): Promise<OscratAssessmentSummary[]> => {
  const assessments = await prisma.oscratProductAssessment.findMany({
    where: { versionId },
    select: ASSESSMENT_SUMMARY_SELECT,
    orderBy: { createdAt: 'desc' },
  });

  return assessments.map(transformToAssessmentSummary);
};

/** Get detailed information for a specific assessment by version */
export const getVersionAssessmentDetail = async (
  teamId: string,
  versionId: string,
  assessmentId: string
): Promise<OscratAssessmentDetail | null> => {
  const assessment = await prisma.oscratProductAssessment.findFirst({
    where: {
      id: assessmentId,
      versionId,
    },
    select: ASSESSMENT_DETAIL_SELECT,
  });

  return assessment ? transformToAssessmentDetail(assessment) : null;
};

/** Create a new assessment for a specific version */
export const createVersionAssessment = async (
  teamId: string,
  versionId: string,
  data: OscratAssessmentCreate
): Promise<OscratAssessmentDetail> => {
  // Get productId from version
  const version = await prisma.oscratProductVersion.findUnique({
    where: { id: versionId },
    select: { productId: true },
  });

  if (!version) {
    throw new Error(`Version ${versionId} not found`);
  }

  const assessment = await prisma.oscratProductAssessment.create({
    data: {
      type: data.type,
      schemaVersion: data.schemaVersion,
      rawData: data.rawData as Prisma.InputJsonValue,
      versionId,
      productId: version.productId,
      createdBy: data.createdBy,
    },
    select: ASSESSMENT_DETAIL_SELECT,
  });

  return transformToAssessmentDetail(assessment);
};

/** Delete an assessment from a specific version */
export const deleteVersionAssessment = async (
  teamId: string,
  versionId: string,
  assessmentId: string
): Promise<void> => {
  // Verify assessment exists and belongs to this version
  const assessment = await prisma.oscratProductAssessment.findFirst({
    where: {
      id: assessmentId,
      versionId,
    },
    select: { id: true },
  });

  if (!assessment) {
    throw new Error(
      `Assessment ${assessmentId} not found for version ${versionId}`
    );
  }

  // Delete the assessment
  await prisma.oscratProductAssessment.delete({
    where: { id: assessmentId },
  });
};
