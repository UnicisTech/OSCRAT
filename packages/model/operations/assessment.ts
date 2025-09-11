import {
  PrismaClient,
  type Prisma,
  OscratProductVersionStatus,
} from '@prisma/client';
import type {
  OscratAssessmentCreate,
  OscratAssessmentSummary,
  OscratAssessmentDetail,
} from '../types/assessment';

/** Select for assessment summary queries */
const ASSESSMENT_SUMMARY_SELECT = {
  id: true,
  type: true,
  schemaVersion: true,
  versionId: true,
  productId: true,
  createdAt: true,
  createdBy: true,
};

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
};

/** Type aliases for better maintainability */
type AssessmentSummaryPayload = Prisma.OscratProductAssessmentGetPayload<{
  select: typeof ASSESSMENT_SUMMARY_SELECT;
}>;

type AssessmentDetailPayload = Prisma.OscratProductAssessmentGetPayload<{
  select: typeof ASSESSMENT_DETAIL_SELECT;
}>;

// Transform functions
/** Transform Prisma assessment to AssessmentSummary */
export const transformToAssessmentSummary = (
  assessment: AssessmentSummaryPayload
): OscratAssessmentSummary => ({
  id: assessment.id,
  type: assessment.type,
  schemaVersion: assessment.schemaVersion,
  versionId: assessment.versionId,
  productId: assessment.productId,
  createdAt: assessment.createdAt,
  createdBy: assessment.createdBy,
});

/** Transform Prisma assessment to AssessmentDetail */
export const transformToAssessmentDetail = (
  assessment: AssessmentDetailPayload
): OscratAssessmentDetail => ({
  id: assessment.id,
  type: assessment.type,
  schemaVersion: assessment.schemaVersion,
  rawData: assessment.rawData as Record<string, any>,
  versionId: assessment.versionId,
  productId: assessment.productId,
  createdAt: assessment.createdAt,
  createdBy: assessment.createdBy,
});

// Query functions
/** Get all assessments for a specific product */
export const getAssessments = async (
  prisma: PrismaClient,
  teamId: string,
  productId: string
): Promise<OscratAssessmentSummary[]> => {
  // Verify product ownership first
  const team = await prisma.team.findUnique({
    where: { id: teamId },
    include: {
      products: {
        where: { id: productId },
        select: { id: true }, // Only need to verify existence
      },
    },
  });

  if (!team || team.products.length === 0) {
    throw new Error(`Product ${productId} not found for team: ${teamId}`);
  }

  const assessments = await prisma.oscratProductAssessment.findMany({
    where: { productId: productId },
    select: ASSESSMENT_SUMMARY_SELECT,
    orderBy: { createdAt: 'desc' },
  });

  return assessments.map(transformToAssessmentSummary);
};

/** Get detailed information for a specific assessment */
export const getAssessmentDetail = async (
  prisma: PrismaClient,
  teamId: string,
  productId: string,
  assessmentId: string
): Promise<OscratAssessmentDetail | null> => {
  // Verify product ownership first
  const team = await prisma.team.findUnique({
    where: { id: teamId },
    include: {
      products: {
        where: { id: productId },
        select: { id: true }, // Only need to verify existence
      },
    },
  });

  if (!team || team.products.length === 0) {
    throw new Error(`Product ${productId} not found for team: ${teamId}`);
  }

  const assessment = await prisma.oscratProductAssessment.findFirst({
    where: {
      id: assessmentId,
      productId: productId,
    },
    select: ASSESSMENT_DETAIL_SELECT,
  });

  return assessment ? transformToAssessmentDetail(assessment) : null;
};

/** Create a new assessment for a product */
export const createAssessment = async (
  prisma: PrismaClient,
  teamId: string,
  productId: string,
  data: OscratAssessmentCreate
): Promise<OscratAssessmentDetail> => {
  // Verify product ownership and find active version
  const team = await prisma.team.findUnique({
    where: { id: teamId },
    include: {
      products: {
        where: { id: productId },
        include: {
          versions: {
            where: { status: OscratProductVersionStatus.ACTIVE },
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      },
    },
  });

  if (!team || team.products.length === 0) {
    throw new Error(`Product ${productId} not found for team: ${teamId}`);
  }

  const product = team.products[0];
  const activeVersion = product.versions[0];

  if (!activeVersion) {
    throw new Error(`No active version found for product ${productId}`);
  }

  const assessment = await prisma.oscratProductAssessment.create({
    data: {
      type: data.type,
      schemaVersion: data.schemaVersion,
      rawData: data.rawData as Prisma.InputJsonValue,
      versionId: activeVersion.id,
      productId: productId,
      createdBy: data.createdBy,
    },
    select: ASSESSMENT_DETAIL_SELECT,
  });

  return transformToAssessmentDetail(assessment);
};

// Mutation functions
/** Delete an assessment */
export const deleteAssessment = async (
  prisma: PrismaClient,
  teamId: string,
  productId: string,
  assessmentId: string
): Promise<void> => {
  // Verify product ownership first
  const team = await prisma.team.findUnique({
    where: { id: teamId },
    include: {
      products: {
        where: { id: productId },
        select: { id: true }, // Only need to verify existence
      },
    },
  });

  if (!team || team.products.length === 0) {
    throw new Error(`Product ${productId} not found for team: ${teamId}`);
  }

  // Verify assessment exists and belongs to this product
  const assessment = await prisma.oscratProductAssessment.findFirst({
    where: {
      id: assessmentId,
      productId: productId,
    },
    select: { id: true },
  });

  if (!assessment) {
    throw new Error(
      `Assessment ${assessmentId} not found for product ${productId}`
    );
  }

  // Delete the assessment
  await prisma.oscratProductAssessment.delete({
    where: { id: assessmentId },
  });
};

/** Get all assessments for a specific product version */
export const getVersionAssessments = async (
  prisma: PrismaClient,
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

// Version-specific functions
/** Get detailed information for a specific assessment by version */
export const getVersionAssessmentDetail = async (
  prisma: PrismaClient,
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
  prisma: PrismaClient,
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
  prisma: PrismaClient,
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
