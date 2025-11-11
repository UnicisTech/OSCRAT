import { useState, useEffect, useCallback } from 'react';
import { ComplianceState } from '@/types/compliance';
import { OscratOrganizationRole, OscratAssessmentType, OscratAssessmentCreateRequest } from '@oscrat/model';
import { useAssessments, useOscratAssessment } from './useOscratAssessment';
import { useLatestAssessment } from './useLatestAssessment';
import { transformComplianceStateToAssessmentData, transformVersionAssessmentToComplianceState } from '@/utils/compliance';
import { ASSESSMENT_SCHEMA_VERSION, STORAGE_KEY_PREFIX } from '@/lib/compliance/constants';

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
  const storageKey = `${STORAGE_KEY_PREFIX.VERSION_COMPLIANCE}_${versionId}`;

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

  const { assessment: assessmentDetail, updateAssessment, deleteAssessment } = useOscratAssessment(
    teamSlug,
    latestAssessmentId || '',
    { enabled: !!latestAssessmentId }
  );

  const [complianceState, setComplianceState] = useState<ComplianceState | null>(null);

  useEffect(() => {
    if (assessmentDetail?.rawData) {
      const state = transformVersionAssessmentToComplianceState(
        assessmentDetail.rawData,
        productId,
        teamRole
      );
      if (state) {
        setComplianceState(state);
        return;
      }
    }

    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as ComplianceState;
        setComplianceState(parsed);
      } catch {
        localStorage.removeItem(storageKey);
        setComplianceState(null);
      }
    }
  }, [assessmentDetail, storageKey, productId, teamRole]);

  const saveToLocalStorage = useCallback(
    (state: ComplianceState) => {
      if (!state.completed) {
        localStorage.setItem(storageKey, JSON.stringify(state));
      }
    },
    [storageKey]
  );

  const saveToDatabase = useCallback(
    async (state: ComplianceState) => {
      if (!userId) return;

      const rawData = transformComplianceStateToAssessmentData(state);

      if (latestAssessmentId) {
        await updateAssessment({
          schemaVersion: ASSESSMENT_SCHEMA_VERSION,
          rawData,
        });
      } else {
        const assessmentData: OscratAssessmentCreateRequest = {
          type: OscratAssessmentType.COMPLIANCE,
          schemaVersion: ASSESSMENT_SCHEMA_VERSION,
          rawData,
          productId,
          versionId,
          createdBy: userId,
        };
        await createAssessment(assessmentData);
      }

      localStorage.removeItem(storageKey);
    },
    [userId, latestAssessmentId, updateAssessment, createAssessment, storageKey, productId, versionId]
  );

  const resetAssessment = useCallback(async () => {
    if (latestAssessmentId) {
      await deleteAssessment();
    }
    localStorage.removeItem(storageKey);
    setComplianceState(null);
  }, [latestAssessmentId, deleteAssessment, storageKey]);

  return {
    complianceState,
    setComplianceState,
    saveToLocalStorage,
    saveToDatabase,
    resetAssessment,
    latestAssessmentId,
    isCreating,
  };
}



