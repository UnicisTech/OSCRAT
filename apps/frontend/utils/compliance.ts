import { ComplianceState } from '@/types/compliance';
import { ComplianceAssessmentRawData, validateComplianceAssessmentRawData } from '@/types/assessmentRawData';
import { OscratOrganizationRole } from '@oscrat/model';

/**
 * Transform ComplianceState to raw assessment data (common for both ORG and VERSION)
 */
export const transformComplianceStateToAssessmentData = (
  state: ComplianceState
): ComplianceAssessmentRawData => {
  return {
    compliance_results: {
      assessments: state.assessments,
      completedAt: new Date().toISOString(),
      startedAt: state.startedAt,
      lastUpdatedAt: state.lastUpdatedAt,
      completedAreas: state.completedAreas,
      completedRequirements: state.completedRequirements,
      teamRole: state.teamRole,
      completed: state.completed,
      started: state.started,
    },
  };
};

/**
 * Transform raw assessment data to ComplianceState for ORG compliance
 * ORG compliance doesn't have productId
 */
export const transformOrgAssessmentToComplianceState = (
  rawData: unknown,
  teamRole: OscratOrganizationRole
): ComplianceState | null => {
  if (!validateComplianceAssessmentRawData(rawData)) {
    return null;
  }

  const results = rawData.compliance_results;

  return {
    productId: '',
    teamRole,
    assessments: results.assessments,
    currentAreaIndex: null,
    currentRequirementIndex: null,
    completedAreas: results.completedAreas,
    completedRequirements: results.completedRequirements,
    startedAt: results.startedAt,
    lastUpdatedAt: results.lastUpdatedAt,
    completed: results.completed,
    started: results.started ?? false,
  };
};

/**
 * Transform raw assessment data to ComplianceState for VERSION compliance
 * VERSION compliance requires productId
 */
export const transformVersionAssessmentToComplianceState = (
  rawData: unknown,
  productId: string,
  teamRole: OscratOrganizationRole
): ComplianceState | null => {
  if (!validateComplianceAssessmentRawData(rawData)) {
    return null;
  }

  const results = rawData.compliance_results;

  return {
    productId,
    teamRole,
    assessments: results.assessments,
    currentAreaIndex: null,
    currentRequirementIndex: null,
    completedAreas: results.completedAreas,
    completedRequirements: results.completedRequirements,
    startedAt: results.startedAt,
    lastUpdatedAt: results.lastUpdatedAt,
    completed: results.completed,
    started: results.started ?? false,
  };
};