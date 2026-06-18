import { useState, useEffect, useCallback } from 'react';
import { ComplianceState } from '@/types/compliance';
import {
  OscratOrganizationRole,
  OscratAssessmentType,
  OscratAssessmentCreateRequest,
} from '@oscrat/model';
import { useAssessments, useOscratAssessment } from './useOscratAssessment';
import { useLatestAssessment } from './useLatestAssessment';
import {
  transformComplianceStateToAssessmentData,
  transformVersionAssessmentToComplianceState,
} from '@/utils/compliance';
import { ASSESSMENT_SCHEMA_VERSION } from '@/lib/compliance/constants';

interface UseVersionComplianceOptions {
  teamSlug: string;
  productId: string;
  versionId: string;
  teamRole: OscratOrganizationRole;
  userId: string | undefined;
}

export function useVersionCompliance({
  teamSlug,
  productId,
  versionId,
  teamRole,
  userId,
}: UseVersionComplianceOptions) {
  const { assessments, createAssessment, isCreating } = useAssessments(
    teamSlug,
    { productId, versionId },
    { enabled: true }
  );

  const latestAssessmentId = useLatestAssessment(
    assessments,
    OscratAssessmentType.COMPLIANCE,
    { productId, versionId }
  );

  const {
    assessment: assessmentDetail,
    updateAssessment,
    deleteAssessment,
  } = useOscratAssessment(teamSlug, latestAssessmentId || '', {
    enabled: !!latestAssessmentId,
  });

  const [complianceState, setComplianceState] =
    useState<ComplianceState | null>(null);

  useEffect(() => {
    if (assessmentDetail?.rawData) {
      const state = transformVersionAssessmentToComplianceState(
        assessmentDetail.rawData,
        productId,
        teamRole
      );
      if (state) {
        setComplianceState(state);
      }
    }
  }, [assessmentDetail, productId, teamRole]);

  const saveToDatabase = useCallback(
    async (state: ComplianceState): Promise<string | undefined> => {
      if (!userId) return undefined;

      const rawData = transformComplianceStateToAssessmentData(state);

      if (latestAssessmentId) {
        await updateAssessment({
          schemaVersion: ASSESSMENT_SCHEMA_VERSION,
          rawData,
        });
        return latestAssessmentId;
      }

      const assessmentData: OscratAssessmentCreateRequest = {
        type: OscratAssessmentType.COMPLIANCE,
        schemaVersion: ASSESSMENT_SCHEMA_VERSION,
        rawData,
        productId,
        versionId,
        createdBy: userId,
      };
      const created = await createAssessment(assessmentData);
      return created?.id;
    },
    [
      userId,
      latestAssessmentId,
      updateAssessment,
      createAssessment,
      productId,
      versionId,
    ]
  );

  const resetAssessment = useCallback(async () => {
    if (latestAssessmentId) {
      await deleteAssessment();
    }
    setComplianceState(null);
  }, [latestAssessmentId, deleteAssessment]);

  return {
    complianceState,
    setComplianceState,
    saveToDatabase,
    resetAssessment,
    latestAssessmentId,
    isCreating,
  };
}
