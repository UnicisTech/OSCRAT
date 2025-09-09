import { 
  ApplicabilityQuestion, 
  RiskQuestion,
  CraQuestion
} from '@oscrat/model';
import { 
  FormAnswers, 
  FormState, 
  RISK_LEVEL_PRIORITY,
  isRiskAnswer 
} from '@/types/craForm';

const LOCALSTORAGE_KEY = 'craFormState';

/**
 * Given all questions and a question id, return its 1-based step number.
 */
export const getStepNumberById = (
  questions: Array<CraQuestion>,
  questionId: string
): number => {
  const index = questions.findIndex((q) => q.id === questionId);
  return index + 1;
};

/**
 * Compare two risk levels and return the higher priority one
 */
export const compareRiskLevels = (level1: string | null, level2: string): string => {
  if (!level1) return level2;
  const priority1 = RISK_LEVEL_PRIORITY[level1];
  const priority2 = RISK_LEVEL_PRIORITY[level2];
  return priority2 > priority1 ? level2 : level1;
};

/**
 * Calculate the highest risk level from all answers
 */
export const calculateHighestRiskFromAnswers = (answers: FormAnswers): string | null => {
  let highest: string | null = null;
  
  Object.values(answers).forEach(({ answer }) => {
    if (isRiskAnswer(answer) && answer.riskLevel) {
      highest = compareRiskLevels(highest, answer.riskLevel);
    }
  });
  
  return highest;
};

/**
 * Check if an answer is eliminatory
 */
export const checkIsEliminatory = (
  question: ApplicabilityQuestion | RiskQuestion, 
  answerText: string
): boolean => {

  const answer = question.answerOptions.find(option => option.text === answerText);
  return (answer && 'isEliminatory' in answer) ? answer.isEliminatory : false;
};

/**
 * Save form state to localStorage
 */
export const saveFormState = (state: FormState): void => {
  try {
    localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Failed to save form state:', error);
  }
};

/**
 * Load form state from localStorage
 */
export const loadFormState = (): Partial<FormState> | null => {
  try {
    const savedState = localStorage.getItem(LOCALSTORAGE_KEY);
    if (!savedState) return null;
    
    const parsed = JSON.parse(savedState);
    return {
      answers: parsed.answers || {},
      activeStep: parsed.activeStep || 1,
      skippedQuestions: parsed.skippedQuestions || [],
      highestRiskLevel: parsed.highestRiskLevel || null
    };
  } catch (error) {
    console.error('Failed to load form state:', error);
    return null;
  }
};

/**
 * Clear form state from localStorage
 */
export const clearFormState = (): void => {
  localStorage.removeItem(LOCALSTORAGE_KEY);
};

/**
 * Get skipped questions between two steps
 */
export const getSkippedQuestions = (
  fromStep: number, 
  toStep: number, 
  existingSkipped: Set<number>
): Set<number> => {
  const newSkippedQuestions = new Set(existingSkipped);
  for (let i = fromStep + 1; i < toStep; i++) {
    newSkippedQuestions.add(i);
  }
  return newSkippedQuestions;
};

/**
 * Find the previous non-skipped step
 */
export const findPreviousNonSkippedStep = (
  currentStep: number, 
  skippedQuestions: Set<number>
): number => {
  for (let i = currentStep - 1; i >= 1; i--) {
    if (!skippedQuestions.has(i)) {
      return i;
    }
  }
  return 1; 
};
