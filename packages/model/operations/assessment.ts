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
import { createPatch } from 'rfc6902';
import { fromJsonObject, toJsonInput } from '../utils/json';
import { createAuditContextWithTx, logCreate, logDelete, CrudType, EntityType, type AuditInfo } from '../audit';

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
  rawData: fromJsonObject<Record<string, any>>(assessment.rawData),
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
  data: OscratAssessmentCreate,
  auditInfo: AuditInfo
): Promise<OscratAssessmentDetail> => {
  return await prisma.$transaction(async (tx) => {
    const audit = createAuditContextWithTx(tx, auditInfo);

    if (data.type === 'ORG' && (data.productId || data.versionId)) {
      throw new Error('ORG assessments cannot have productId or versionId');
    }
    if (data.type === 'CRA' && (!data.productId || data.versionId)) {
      throw new Error('CRA assessments require productId only');
    }
    if (data.type === 'COMPLIANCE' && (!data.productId || !data.versionId)) {
      throw new Error('COMPLIANCE assessments require both productId and versionId');
    }

    if (data.productId) {
      const product = await tx.oscratProduct.findFirst({
        where: { id: data.productId, teamId },
        select: { id: true },
      });
      if (!product) {
        throw new Error(`Product ${data.productId} not found for team ${teamId}`);
      }
    }

    if (data.versionId) {
      const version = await tx.oscratProductVersion.findFirst({
        where: { id: data.versionId, product: { teamId } },
        select: { id: true },
      });
      if (!version) {
        throw new Error(`Version ${data.versionId} not found for team ${teamId}`);
      }
    }

    const assessment = await tx.oscratAssessment.create({
      data: {
        type: data.type,
        schemaVersion: data.schemaVersion,
        rawData: toJsonInput(data.rawData),
        teamId,
        productId: data.productId ?? null,
        versionId: data.versionId ?? null,
        createdBy: data.createdBy,
      },
      select: ASSESSMENT_DETAIL_SELECT,
    });

    await logCreate(EntityType.Assessment, audit, {
      ...assessment,
      name: `${assessment.type}-${assessment.id.slice(0, 8)}`,
    });

    return transformToAssessmentDetail(assessment);
  });
};

/** Update an assessment */
export const updateAssessment = async (
  prisma: PrismaClient,
  teamId: string,
  assessmentId: string,
  data: Partial<Pick<OscratAssessmentCreate, 'schemaVersion' | 'rawData'>>,
  auditInfo: AuditInfo
): Promise<OscratAssessmentDetail> => {
  return await prisma.$transaction(async (tx) => {
    const audit = createAuditContextWithTx(tx, auditInfo);

    const existing = await tx.oscratAssessment.findFirst({
      where: { id: assessmentId, teamId },
      select: ASSESSMENT_DETAIL_SELECT,
    });

    if (!existing) {
      throw new Error(`Assessment ${assessmentId} not found for team ${teamId}`);
    }

    const assessment = await tx.oscratAssessment.update({
      where: { id: assessmentId },
      data: {
        ...(data.schemaVersion && { schemaVersion: data.schemaVersion }),
        ...(data.rawData && { rawData: toJsonInput(data.rawData) }),
      },
      select: ASSESSMENT_DETAIL_SELECT,
    });

    // The meaningful change on an assessment update is its `rawData` (the
    // submitted answers), which is intentionally not a TRACKED_FIELD diff, so
    // the generic logUpdate would silently no-op. Detect a real change by
    // diffing the previous/next rawData (order-independent) plus schemaVersion,
    // and only emit an audit event when something actually changed. This keeps
    // idempotent re-submits from writing noisy false "edited" rows.
    const rawDataChanged =
      createPatch(
        fromJsonObject<Record<string, unknown>>(existing.rawData),
        fromJsonObject<Record<string, unknown>>(assessment.rawData)
      ).length > 0;
    const schemaVersionChanged = existing.schemaVersion !== assessment.schemaVersion;

    if (rawDataChanged || schemaVersionChanged) {
      await audit.log({
        action: 'assessment.update',
        crud: CrudType.Update,
        user: audit.user,
        team: audit.team,
        target: {
          id: assessment.id,
          name: `${assessment.type}-${assessment.id.slice(0, 8)}`,
          type: EntityType.Assessment,
        },
        productId: assessment.productId ?? audit.productId,
        versionId: assessment.versionId ?? audit.versionId,
        metadata: {
          rawDataChanged: String(rawDataChanged),
          schemaVersionChanged: String(schemaVersionChanged),
          schemaVersion: assessment.schemaVersion,
        },
      });
    }

    return transformToAssessmentDetail(assessment);
  });
};

// Mutation functions
/** Delete an assessment */
export const deleteAssessment = async (
  prisma: PrismaClient,
  teamId: string,
  assessmentId: string,
  auditInfo: AuditInfo
): Promise<void> => {
  await prisma.$transaction(async (tx) => {
    const audit = createAuditContextWithTx(tx, auditInfo);

    const assessment = await tx.oscratAssessment.findFirst({
      where: { id: assessmentId, teamId },
      select: { id: true, type: true, productId: true, versionId: true },
    });

    if (!assessment) {
      throw new Error(`Assessment ${assessmentId} not found for team ${teamId}`);
    }

    await logDelete(EntityType.Assessment, audit, {
      ...assessment,
      name: `${assessment.type}-${assessment.id.slice(0, 8)}`,
    });

    await tx.oscratAssessment.delete({
      where: { id: assessmentId },
    });
  });
};
