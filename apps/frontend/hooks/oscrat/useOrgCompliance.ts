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
  transformOrgAssessmentToComplianceState,
} from '@/utils/compliance';
import { ASSESSMENT_SCHEMA_VERSION } from '@/lib/compliance/constants';

interface UseOrgComplianceOptions {
  teamSlug: string;
  teamId: string;
  teamRole: OscratOrganizationRole;
  userId: string | undefined;
}

export function useOrgCompliance({
  teamSlug,
  teamId: _teamId,
  teamRole,
  userId,
}: UseOrgComplianceOptions) {
  const { assessments, createAssessment, isCreating } = useAssessments(
    teamSlug,
    {},
    { enabled: true }
  );

  const latestAssessmentId = useLatestAssessment(
    assessments,
    OscratAssessmentType.ORG
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
      const state = transformOrgAssessmentToComplianceState(
        assessmentDetail.rawData,
        teamRole
      );
      if (state) {
        setComplianceState(state);
      }
    }
  }, [assessmentDetail, teamRole]);

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
        type: OscratAssessmentType.ORG,
        schemaVersion: ASSESSMENT_SCHEMA_VERSION,
        rawData,
        createdBy: userId,
      };
      const created = await createAssessment(assessmentData);
      return created?.id;
    },
    [userId, latestAssessmentId, updateAssessment, createAssessment]
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
