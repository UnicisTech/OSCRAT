import { useMemo, useCallback } from 'react';
import { ComplianceState } from '@/types/compliance';
import { OscratOrganizationRole } from '@oscrat/model';

interface UseComplianceStateParams {
  versionId: string | null;
  teamRole: OscratOrganizationRole | null;
}

interface UseComplianceStateReturn {
  complianceState: ComplianceState | null;
  saveComplianceState: (state: ComplianceState) => void;
  clearComplianceState: () => void;
}

function getStorageKey(versionId: string): string {
  return `compliance_${versionId}`;
}

function getDefaultComplianceState(
  versionId: string,
  teamRole: OscratOrganizationRole
): ComplianceState {
  return {
    productId: versionId,
    teamRole,
    assessments: [],
    currentAreaIndex: null,
    currentRequirementIndex: null,
    completedAreas: [],
    completedRequirements: [],
    startedAt: new Date().toISOString(),
    lastUpdatedAt: new Date().toISOString(),
    completed: false,
    started: false,
    finished: false,
  };
}

export function useComplianceState({
  versionId,
  teamRole,
}: UseComplianceStateParams): UseComplianceStateReturn {
  const complianceState = useMemo<ComplianceState | null>(() => {
    if (!teamRole || !versionId) return null;

    const storageKey = getStorageKey(versionId);
    const saved = localStorage.getItem(storageKey);

    if (saved) {
      try {
        return JSON.parse(saved) as ComplianceState;
      } catch {
        localStorage.removeItem(storageKey);
      }
    }

    return getDefaultComplianceState(versionId, teamRole);
  }, [teamRole, versionId]);

  const saveComplianceState = useCallback(
    (state: ComplianceState) => {
      if (!versionId) return;
      const storageKey = getStorageKey(versionId);
      localStorage.setItem(storageKey, JSON.stringify(state));
    },
    [versionId]
  );

  const clearComplianceState = useCallback(() => {
    if (!versionId) return;
    const storageKey = getStorageKey(versionId);
    localStorage.removeItem(storageKey);
  }, [versionId]);

  return {
    complianceState,
    saveComplianceState,
    clearComplianceState,
  };
}
