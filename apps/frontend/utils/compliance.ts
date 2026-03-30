import { ComplianceArea, ComplianceState, RequirementAssessment } from '@/types/compliance';
import { ComplianceAssessmentRawData, validateComplianceAssessmentRawData } from '@/types/assessmentRawData';
import { OscratOrganizationRole } from '@oscrat/model';
import { CONFORMITY_STATUS } from '@/constants/conformityStatuses';
import type { ComplianceNamespace } from '@/lib/compliance/translations';
import type { TFunction } from 'next-i18next';
import checklistTranslations from '@/locales/en/compliance-tech-doc-checklist.json';

export interface RequirementStatus {
  id: string;
  name: string;
  areaName: string;
  isEvaluated: boolean;
  conformityStatus: string;
  completionPercentage: number;
  assessment?: RequirementAssessment;
}

export const computeRequirementsStatus = (
  complianceData: ComplianceArea[],
  assessments: RequirementAssessment[],
  t: TFunction,
  complianceNamespace: ComplianceNamespace
): RequirementStatus[] => {
  const allRequirements: RequirementStatus[] = [];

  complianceData.forEach((area) => {
    area.content.forEach((req) => {
      const assessment = assessments.find(
        (a) => a.requirementId === req.reqId
      );
      const totalQuestions = req.questions.length;
      const answeredQuestions = assessment?.answers.length || 0;
      const completionPercentage =
        totalQuestions > 0
          ? Math.round((answeredQuestions / totalQuestions) * 100)
          : 0;

      const isEvaluated = assessment?.complianceStatus !== undefined;

      let conformityStatus: string = CONFORMITY_STATUS.NOT_COMPLIANT;
      if (isEvaluated && assessment?.complianceStatus) {
        conformityStatus = assessment.complianceStatus;
      } else if (completionPercentage > 0 && completionPercentage < 100) {
        conformityStatus = `${CONFORMITY_STATUS.IN_EVALUATION} [${completionPercentage}%]`;
      }

      const translateKey = (key: string) => {
        if (area.areaType === 'checklist') {
          return (checklistTranslations as Record<string, string>)[key] ?? key;
        }
        return t(key, { ns: complianceNamespace });
      };

      allRequirements.push({
        id: req.reqId,
        name: translateKey(req.requirement),
        areaName: translateKey(area.areaOfRequirements),
        isEvaluated,
        conformityStatus,
        completionPercentage,
        assessment,
      });
    });
  });

  return allRequirements;
};

export const getStatusBadgeColor = (status: string): string => {
  if (status === CONFORMITY_STATUS.FULLY_COMPLIANT) return 'bg-green-100 text-green-800';
  if (status === CONFORMITY_STATUS.PARTIALLY_COMPLIANT) return 'bg-yellow-100 text-yellow-800';
  if (status === CONFORMITY_STATUS.NOT_COMPLIANT) return 'bg-red-100 text-red-800';
  if (status === CONFORMITY_STATUS.NOT_APPLICABLE) return 'bg-gray-100 text-gray-800';
  if (status.startsWith(CONFORMITY_STATUS.IN_EVALUATION)) return 'bg-blue-100 text-blue-800';
  return 'bg-gray-100 text-gray-600';
};

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
      finished: state.finished,
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
    finished: results.finished ?? false,
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
    finished: results.finished ?? false,
  };
};