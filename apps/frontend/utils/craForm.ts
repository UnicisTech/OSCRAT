import {
  ApplicabilityQuestion,
  RiskQuestion,
  CraQuestion,
  OscratProductCategory,
} from '@oscrat/model';
import {
  FormAnswers,
  FormState,
  RISK_LEVEL_PRIORITY,
  isRiskAnswer,
  RiskLevel,
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
export const compareRiskLevels = (
  level1: RiskLevel | null,
  level2: RiskLevel
): RiskLevel => {
  if (!level1) return level2;
  const priority1 = RISK_LEVEL_PRIORITY[level1];
  const priority2 = RISK_LEVEL_PRIORITY[level2];
  return priority2 > priority1 ? level2 : level1;
};

/**
 * Calculate the highest risk level from all answers
 */
export const calculateHighestRiskFromAnswers = (
  answers: FormAnswers
): RiskLevel | null => {
  let highest: RiskLevel | null = null;

  Object.values(answers).forEach(({ answer }) => {
    if (isRiskAnswer(answer) && answer.riskLevel) {
      highest = compareRiskLevels(highest, answer.riskLevel as RiskLevel);
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
  const answer = question.answerOptions.find(
    (option) => option.text === answerText
  );
  return answer && 'isEliminatory' in answer ? answer.isEliminatory : false;
};

/**
 * Format risk level for display
 * Converts underscore-separated strings to readable format
 * e.g., "important_class_i" -> "IMPORTANT CLASS I"
 */
export const formatRiskLevel = (level: string | null): string => {
  if (!level) return 'Unknown';
  return level.replace(/_/g, ' ').toUpperCase();
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

/**
 * Map CRA risk level to product category
 */
export const getProductCategoryFromRisk = (
  riskLevel: RiskLevel
): OscratProductCategory => {
  switch (riskLevel) {
    case RiskLevel.CRITICAL:
      return OscratProductCategory.CRITICAL;
    case RiskLevel.IMPORTANT_CLASS_I:
      return OscratProductCategory.IMPORTANT_CLASS_I;
    case RiskLevel.IMPORTANT_CLASS_II:
      return OscratProductCategory.IMPORTANT_CLASS_II;
    default:
      return OscratProductCategory.DEFAULT;
  }
};

/**
 * Save form state to localStorage (temporary storage during workflow)
 */
export const saveFormState = (state: FormState): void => {
  try {
    localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Failed to save form state to localStorage:', error);
  }
};

/**
 * Load form state from localStorage (temporary storage during workflow)
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
      highestRiskLevel: parsed.highestRiskLevel || null,
      completed: parsed.completed || false,
      completedAt: parsed.completedAt || null,
    };
  } catch (error) {
    console.error('Failed to load form state from localStorage:', error);
    return null;
  }
};

/**
 * Clear form state from localStorage (called after successful product creation)
 */
export const clearFormState = (): void => {
  try {
    localStorage.removeItem(LOCALSTORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear form state from localStorage:', error);
  }
};

/**
 * Transform CRA FormState to assessment rawData format for database storage
 * IMPORTANT: This saves all answers to the database
 */
export const transformFormStateToAssessmentData = (
  formState: FormState
): Record<string, any> => {
  // Validate that we have answers
  if (!formState.answers || Object.keys(formState.answers).length === 0) {
    console.error('FormState has no answers to save!', formState);
    throw new Error('Cannot save assessment: FormState contains no answers');
  }

  // Ensure skippedQuestions is an array (handles runtime cases where it might be a Set)
  const skippedQuestions: number[] | Set<number> | unknown =
    formState.skippedQuestions;
  const skippedQuestionsArray = Array.isArray(skippedQuestions)
    ? skippedQuestions
    : skippedQuestions instanceof Set
      ? Array.from(skippedQuestions as Set<number>)
      : [];

  return {
    questionnaire_results: {
      answers: formState.answers, // ALL answers with question IDs as keys
      completedAt: formState.completedAt || new Date().toISOString(),
      highestRiskLevel: formState.highestRiskLevel,
      skippedQuestions: skippedQuestionsArray,
      activeStep: formState.activeStep, // Also save activeStep for reference
    },
  };
};
