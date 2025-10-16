// Types for compliance questionnaire structure

export type AnswerType = 'boolean' | 'text';
export type ComplianceStatus = 'Fully compliant' | 'Partially compliant' | 'Not Compliant' | 'Not Applicable';

export interface Evidence {
  type: 'fileUpload';
  required: boolean;
  hint?: string;
}

export interface AdditionalInformation {
  type: 'text';
  required: boolean;
}

export interface ComplianceQuestion {
  questionId: string;
  questionText: string;
  answerType: AnswerType;
  options?: string[];
  evidence?: Evidence;
  additionalInformation?: AdditionalInformation;
}

export interface ComplianceRequirement {
  reqId: string;
  requirement: string;
  craReference: string;
  hint?: string;
  genericTask?: string;
  questions: ComplianceQuestion[];
}

export interface ComplianceArea {
  id: number;
  areaOfRequirements: string;
  content: ComplianceRequirement[];
}

export interface ComplianceAnswer {
  questionId: string;
  answer: string | boolean;
  additionalInformation?: string;
  evidence?: File | null;
}

export interface RequirementAssessment {
  requirementId: string;
  requirementText: string;
  areaId: number;
  areaText: string;
  answers: ComplianceAnswer[];
  complianceStatus?: ComplianceStatus;
  assessedAt?: string;
}

export interface ComplianceState {
  productId: string;
  teamRole: string;
  assessments: RequirementAssessment[];
  currentAreaIndex: number | null;
  currentRequirementIndex: number | null;
  completedAreas: Array<{ id: number; text: string }>;
  completedRequirements: Array<{ id: string; text: string }>;
  startedAt: string;
  lastUpdatedAt: string;
  completed: boolean;
  started: boolean;
}
