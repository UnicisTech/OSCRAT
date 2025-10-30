import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  CraAnswer,
  CraQuestion,
} from '@oscrat/model';
import { 
  FormAnswers, 
  FormState,
  RiskLevel
} from '@/types/craForm';
import {
  calculateHighestRiskFromAnswers,
  getSkippedQuestions,
  findPreviousNonSkippedStep as findPreviousStep
} from '@/utils/craForm';

interface UseCraFormProps {
  questions: (CraQuestion)[];
  onHighestRiskChange?: (risk: RiskLevel | null) => void;
  initialFormState?: Partial<FormState> | null;
}

interface UseCraFormReturn {
  // State
  answers: FormAnswers;
  activeStep: number;
  skippedQuestions: Set<number>;
  selectedAnswer: CraAnswer | null;
  highestRiskLevel: RiskLevel | null;
  
  // Actions
  handleAnswerChange: (
    question: CraQuestion, 
    answerText: string, 
    answer: CraAnswer
  ) => void;
  setActiveStep: (step: number) => void;
  handleSkip: (fromStep: number, toStep: number) => void;
  findPreviousNonSkippedStep: (currentStep: number) => number;
  clearForm: () => void;
}

export const useCraForm = ({ questions, onHighestRiskChange, initialFormState }: UseCraFormProps): UseCraFormReturn => {
  // Initialize with existing form state if provided (edit mode)
  const [answers, setAnswers] = useState<FormAnswers>(initialFormState?.answers || {});
  const [activeStep, setActiveStep] = useState(initialFormState?.activeStep || 1);
  const [skippedQuestions, setSkippedQuestions] = useState<Set<number>>(
    initialFormState?.skippedQuestions 
      ? new Set(Array.isArray(initialFormState.skippedQuestions) 
          ? initialFormState.skippedQuestions 
          : [])
      : new Set()
  );
  const [highestRiskLevel, setHighestRiskLevel] = useState<RiskLevel | null>(
    initialFormState?.highestRiskLevel || null
  );
  const previousHighestRiskLevelRef = useRef<RiskLevel | null>(
    initialFormState?.highestRiskLevel || null
  );
  const initialRiskLevelRef = useRef<RiskLevel | null>(
    initialFormState?.highestRiskLevel || null
  );

  // Re-initialize form when initialFormState changes (e.g., when loading existing assessment)
  useEffect(() => {
    if (initialFormState) {
      setAnswers(initialFormState.answers || {});
      setActiveStep(initialFormState.activeStep || 1);
      setSkippedQuestions(
        initialFormState.skippedQuestions 
          ? new Set(Array.isArray(initialFormState.skippedQuestions) 
              ? initialFormState.skippedQuestions 
              : [])
          : new Set()
      );
      const initialRisk = initialFormState.highestRiskLevel || null;
      setHighestRiskLevel(initialRisk);
      previousHighestRiskLevelRef.current = initialRisk;
      initialRiskLevelRef.current = initialRisk;
    }
  }, [initialFormState]);

  // Call onHighestRiskChange when highestRiskLevel changes (but not during initialization)
  useEffect(() => {
    const previousValue = previousHighestRiskLevelRef.current;
    if (highestRiskLevel !== previousValue) {
      previousHighestRiskLevelRef.current = highestRiskLevel;
      // Only call callback if this change is not the initial value being set
      // We check if the previous value was the initial value to detect initialization
      if (previousValue !== initialRiskLevelRef.current) {
        onHighestRiskChange?.(highestRiskLevel);
      }
    }
  }, [highestRiskLevel, onHighestRiskChange]);

  // Derive selectedAnswer from current state
  const selectedAnswer = (() => {
    const currentStepIndex = activeStep - 1;
    const currentQuestion = questions?.[currentStepIndex];
    if (currentQuestion && answers[currentQuestion.id]) {
      return answers[currentQuestion.id].answer;
    }
    return null;
  })();

  const handleAnswerChange = useCallback((
    question: CraQuestion,
    answerText: string,
    answer: CraAnswer
  ) => {
    const newAnswers: FormAnswers = {
      ...answers,
      [question.id]: {
        question: question.question,
        answer: answer,
      }
    };
    
    // Clear any skipped questions that come after this question
    // since the new answer might not cause the same skips
    const currentStepIndex = questions.findIndex(q => q.id === question.id);
    const currentStep = currentStepIndex + 1;
    
    const newSkippedQuestions = new Set<number>();
    skippedQuestions.forEach(skippedStep => {
      // Only keep skipped questions that come before the current question
      if (skippedStep < currentStep) {
        newSkippedQuestions.add(skippedStep);
      }
    });
    
    // Remove answers for questions that are no longer skipped (were skipped before but aren't now)
    // This happens when retaking the form and changing an answer that previously caused skips
    const removedSkippedSteps = new Set<number>();
    skippedQuestions.forEach(skippedStep => {
      if (skippedStep >= currentStep && !newSkippedQuestions.has(skippedStep)) {
        removedSkippedSteps.add(skippedStep);
      }
    });
    
    // Remove answers for questions that are now skipped or were previously skipped
    removedSkippedSteps.forEach(stepNum => {
      const questionIndex = stepNum - 1;
      if (questionIndex >= 0 && questionIndex < questions.length) {
        const questionToRemove = questions[questionIndex];
        if (questionToRemove && newAnswers[questionToRemove.id]) {
          delete newAnswers[questionToRemove.id];
        }
      }
    });
    
    setAnswers(newAnswers);
    setSkippedQuestions(newSkippedQuestions);

    // Recalculate highest risk level
    const newHighestRisk = calculateHighestRiskFromAnswers(newAnswers);
    setHighestRiskLevel(newHighestRisk);
  }, [answers, questions, skippedQuestions]);

  const handleSkip = useCallback((fromStep: number, toStep: number) => {
    const newSkippedQuestions = getSkippedQuestions(fromStep, toStep, skippedQuestions);
    
    // Remove answers for ALL questions that are now skipped (including ones that were previously answered but are now skipped)
    // This is important when retaking the form - if an answer changes and causes a skip, we need to clear old answers
    const newAnswers = { ...answers };
    newSkippedQuestions.forEach(skippedStep => {
      const questionIndex = skippedStep - 1;
      if (questionIndex >= 0 && questionIndex < questions.length) {
        const questionToRemove = questions[questionIndex];
        if (questionToRemove && newAnswers[questionToRemove.id]) {
          delete newAnswers[questionToRemove.id];
        }
      }
    });
    
    setAnswers(newAnswers);
    setSkippedQuestions(newSkippedQuestions);
  }, [answers, questions, skippedQuestions]);

  const findPreviousNonSkippedStep = useCallback((currentStep: number): number => {
    return findPreviousStep(currentStep, skippedQuestions);
  }, [skippedQuestions]);

  const clearForm = useCallback(() => {
    setAnswers({});
    setActiveStep(1);
    setSkippedQuestions(new Set());
    setHighestRiskLevel(null);
  }, []); 

  return {
    // State
    answers,
    activeStep,
    skippedQuestions,
    selectedAnswer,
    highestRiskLevel,
    
    // Actions
    handleAnswerChange,
    setActiveStep,
    handleSkip,
    findPreviousNonSkippedStep,
    clearForm
  };
};
