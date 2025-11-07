import { useMemo } from 'react';
import { OscratAssessmentType, OscratAssessmentSummary } from '@oscrat/model';

/**
 * Utility hook to get the latest assessment of a specific type
 * @param assessments - Array of assessments to filter
 * @param type - Assessment type to filter by
 * @param filters - Optional filters for productId and/or versionId
 * @returns The ID of the latest assessment, or null if none found
 */
export function useLatestAssessment(
  assessments: OscratAssessmentSummary[] | undefined,
  type: OscratAssessmentType,
  filters?: { productId?: string; versionId?: string }
): string | null {
  return useMemo(() => {
    if (!assessments || assessments.length === 0) return null;

    let filtered = assessments.filter((a) => a.type === type);

    if (filters?.productId) {
      filtered = filtered.filter((a) => a.productId === filters.productId);
    }

    if (filters?.versionId) {
      filtered = filtered.filter((a) => a.versionId === filters.versionId);
    }

    if (filtered.length === 0) return null;

    const latest = filtered.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )[0];

    return latest.id;
  }, [assessments, type, filters]);
}


