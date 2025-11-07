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
  teamId: true,
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
  teamId: true,
  versionId: true,
  productId: true,
  createdAt: true,
  createdBy: true,
};

/** Type aliases for better maintainability */
type AssessmentSummaryPayload = Prisma.OscratAssessmentGetPayload<{
  select: typeof ASSESSMENT_SUMMARY_SELECT;
}>;

type AssessmentDetailPayload = Prisma.OscratAssessmentGetPayload<{
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
  teamId: assessment.teamId,
  versionId: assessment.versionId ?? undefined,
  productId: assessment.productId ?? undefined,
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
  teamId: assessment.teamId,
  versionId: assessment.versionId ?? undefined,
  productId: assessment.productId ?? undefined,
  createdAt: assessment.createdAt,
  createdBy: assessment.createdBy,
});

// Query functions
/** Get assessments with optional filters */
export const getAssessments = async (
  prisma: PrismaClient,
  teamId: string,
  productId?: string,
  versionId?: string
): Promise<OscratAssessmentSummary[]> => {
  const where: Prisma.OscratAssessmentWhereInput = {
    teamId,
    ...(productId && { productId }),
    ...(versionId && { versionId }),
  };

  const assessments = await prisma.oscratAssessment.findMany({
    where,
    select: ASSESSMENT_SUMMARY_SELECT,
    orderBy: { createdAt: 'desc' },
  });

  return assessments.map(transformToAssessmentSummary);
};

/** Get detailed information for a specific assessment */
export const getAssessmentDetail = async (
  prisma: PrismaClient,
  teamId: string,
  assessmentId: string
): Promise<OscratAssessmentDetail | null> => {
  const assessment = await prisma.oscratAssessment.findFirst({
    where: {
      id: assessmentId,
      teamId,
    },
    select: ASSESSMENT_DETAIL_SELECT,
  });

  return assessment ? transformToAssessmentDetail(assessment) : null;
};

/** Create a new assessment */
export const createAssessment = async (
  prisma: PrismaClient,
  teamId: string,
  data: OscratAssessmentCreate
): Promise<OscratAssessmentDetail> => {
  // Validate ID combinations match assessment type
  if (data.type === 'ORG' && (data.productId || data.versionId)) {
    throw new Error('ORG assessments cannot have productId or versionId');
  }
  if (data.type === 'CRA' && (!data.productId || data.versionId)) {
    throw new Error('CRA assessments require productId only');
  }
  if (data.type === 'COMPLIANCE' && (!data.productId || !data.versionId)) {
    throw new Error('COMPLIANCE assessments require both productId and versionId');
  }

  // Verify product/version belong to team if provided
  if (data.productId) {
    const product = await prisma.oscratProduct.findFirst({
      where: { id: data.productId, teamId },
      select: { id: true },
    });
    if (!product) {
      throw new Error(`Product ${data.productId} not found for team ${teamId}`);
    }
  }

  if (data.versionId) {
    const version = await prisma.oscratProductVersion.findFirst({
      where: { id: data.versionId, product: { teamId } },
      select: { id: true },
    });
    if (!version) {
      throw new Error(`Version ${data.versionId} not found for team ${teamId}`);
    }
  }

  const assessment = await prisma.oscratAssessment.create({
    data: {
      type: data.type,
      schemaVersion: data.schemaVersion,
      rawData: data.rawData as Prisma.InputJsonValue,
      teamId,
      productId: data.productId ?? null,
      versionId: data.versionId ?? null,
      createdBy: data.createdBy,
    },
    select: ASSESSMENT_DETAIL_SELECT,
  });

  return transformToAssessmentDetail(assessment);
};

/** Update an assessment */
export const updateAssessment = async (
  prisma: PrismaClient,
  teamId: string,
  assessmentId: string,
  data: Partial<Pick<OscratAssessmentCreate, 'schemaVersion' | 'rawData'>>
): Promise<OscratAssessmentDetail> => {
  const existing = await prisma.oscratAssessment.findFirst({
    where: { id: assessmentId, teamId },
    select: { id: true },
  });

  if (!existing) {
    throw new Error(`Assessment ${assessmentId} not found for team ${teamId}`);
  }

  const assessment = await prisma.oscratAssessment.update({
    where: { id: assessmentId },
    data: {
      ...(data.schemaVersion && { schemaVersion: data.schemaVersion }),
      ...(data.rawData && { rawData: data.rawData as Prisma.InputJsonValue }),
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
  assessmentId: string
): Promise<void> => {
  const assessment = await prisma.oscratAssessment.findFirst({
    where: { id: assessmentId, teamId },
    select: { id: true },
  });

  if (!assessment) {
    throw new Error(`Assessment ${assessmentId} not found for team ${teamId}`);
  }

  await prisma.oscratAssessment.delete({
    where: { id: assessmentId },
  });
};
