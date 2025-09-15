import { 
  ApplicabilityAnswer, 
  RiskAnswer, 
} from '@oscrat/model';

// Form state types
export interface FormAnswers {
  [questionId: string]: {
    question: string;
    answer: ApplicabilityAnswer | RiskAnswer;
  };
}

export interface FormState {
  answers: FormAnswers;
  activeStep: number;
  skippedQuestions: number[];
  highestRiskLevel: string | null;
  completed?: boolean;
}

export interface CraFormProps {
  setIsNotEligible: (value: boolean) => void;
  setShowResult: (value: boolean) => void;
  setHighestRisk: (value: string | null) => void;
}

export interface FormPageState {
  showResult: boolean;
  isNotEligible: boolean;
  highestRisk: string | null;
}

export enum RiskLevel {
  NONE = 'NONE',
  OTHER = 'OTHER',
  IMPORTANT_CLASS_II = 'IMPORTANT_CLASS_II',
  IMPORTANT_CLASS_I = 'IMPORTANT_CLASS_I',
  CRITICAL = 'CRITICAL'
}

export const RISK_LEVEL_PRIORITY: Record<string, number> = {
  [RiskLevel.NONE]: 0,
  [RiskLevel.OTHER]: 1,
  [RiskLevel.IMPORTANT_CLASS_II]: 2,
  [RiskLevel.IMPORTANT_CLASS_I]: 3,
  [RiskLevel.CRITICAL]: 4
};

// Utility type guards
export const isRiskAnswer = (answer: ApplicabilityAnswer | RiskAnswer): answer is RiskAnswer => {
  return 'riskLevel' in answer;
};

export const isApplicabilityAnswer = (answer: ApplicabilityAnswer | RiskAnswer): answer is ApplicabilityAnswer => {
  return 'isEliminatory' in answer;
};
