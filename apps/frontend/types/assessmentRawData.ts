import { RequirementAssessment } from './compliance';
import { FormAnswers, RiskLevel } from './craForm';

export interface ComplianceAssessmentRawData {
  compliance_results: {
    assessments: RequirementAssessment[];
    completedAt: string;
    startedAt: string;
    lastUpdatedAt: string;
    completedAreas: Array<{ id: number; text: string }>;
    completedRequirements: Array<{ id: string; text: string }>;
    teamRole: string;
    completed: boolean;
    started: boolean;
    finished: boolean;
  };
}

/**
 * CRA assessment raw data (from useForm)
 */
export interface CRAAssessmentRawData {
  questionnaire_results: {
    answers: FormAnswers;
    skippedQuestions?: number[];
    highestRiskLevel?: RiskLevel | null;
    completedAt?: string;
  };
}

/**
<<<<<<< HEAD
 * Validates if rawData has the structure of ComplianceAssessmentRawData
 * 
 * Needed because rawData is stored as unstructured JSON in the database.
 * This provides runtime safety to ensure the data has the expected structure
 * before accessing its properties.
 */
export function validateComplianceAssessmentRawData(
 data: unknown
): data is ComplianceAssessmentRawData {
  if (!data || typeof data !== 'object') return false;
  
  const obj = data as Record<string, unknown>;
  if (!obj.compliance_results || typeof obj.compliance_results !== 'object') return false;
  
  const results = obj.compliance_results as Record<string, unknown>;
  
  return (
    Array.isArray(results.assessments) &&
    Array.isArray(results.completedAreas) &&
    Array.isArray(results.completedRequirements) &&
    typeof results.completed === 'boolean' &&
    typeof results.startedAt === 'string' &&
    typeof results.lastUpdatedAt === 'string'
  );
}

/**
 * Type guard to check if rawData is CRAAssessmentRawData
 */
export function isCRAAssessmentRawData(
  data: unknown
): data is CRAAssessmentRawData {
  if (!data || typeof data !== 'object') return false;
  
  const obj = data as Record<string, unknown>;
  if (!obj.questionnaire_results || typeof obj.questionnaire_results !== 'object') return false;
  
  const results = obj.questionnaire_results as Record<string, unknown>;
  
  return typeof results.answers === 'object' && results.answers !== null;
}