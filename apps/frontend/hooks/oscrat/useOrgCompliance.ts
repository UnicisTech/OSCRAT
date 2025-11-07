import { useState, useEffect, useCallback } from 'react';
import { ComplianceState } from '@/types/compliance';
import { OscratOrganizationRole, OscratAssessmentType, OscratAssessmentCreateRequest } from '@oscrat/model';
import { useAssessments, useOscratAssessment } from './useOscratAssessment';
import { useLatestAssessment } from './useLatestAssessment';
import { transformComplianceStateToAssessmentData, transformOrgAssessmentToComplianceState } from '@/utils/compliance';
import { ASSESSMENT_SCHEMA_VERSION, STORAGE_KEY_PREFIX } from '@/lib/compliance/constants';

interface UseOrgComplianceOptions {
  teamSlug: string;
  teamId: string;
  teamRole: OscratOrganizationRole;
  userId: string | undefined;
}

export function useOrgCompliance({
  teamSlug,
  teamId,
  teamRole,
  userId,
}: UseOrgComplianceOptions) {
  const storageKey = `${STORAGE_KEY_PREFIX.ORG_COMPLIANCE}_${teamId}`;

  const { assessments, createAssessment, isCreating } = useAssessments(teamSlug, {}, { enabled: true });

  const latestAssessmentId = useLatestAssessment(assessments, OscratAssessmentType.ORG);

  const { assessment: assessmentDetail, updateAssessment, deleteAssessment } = useOscratAssessment(
    teamSlug,
    latestAssessmentId || '',
    { enabled: !!latestAssessmentId }
  );

  const [complianceState, setComplianceState] = useState<ComplianceState | null>(null);

  useEffect(() => {
    if (assessmentDetail?.rawData) {
      const state = transformOrgAssessmentToComplianceState(assessmentDetail.rawData, teamRole);
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
  }, [assessmentDetail, storageKey, teamRole]);

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
          type: OscratAssessmentType.ORG,
          schemaVersion: ASSESSMENT_SCHEMA_VERSION,
          rawData,
          createdBy: userId,
        };
        await createAssessment(assessmentData);
      }

      localStorage.removeItem(storageKey);
    },
    [userId, latestAssessmentId, updateAssessment, createAssessment, storageKey]
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
