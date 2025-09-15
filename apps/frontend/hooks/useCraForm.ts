import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  CraAnswer,
  CraQuestion,
} from '@oscrat/model';
import { 
  FormAnswers, 
  FormState 
} from '@/types/craForm';
import {
  calculateHighestRiskFromAnswers,
  saveFormState,
  loadFormState,
  clearFormState,
  getSkippedQuestions,
  findPreviousNonSkippedStep as findPreviousStep
} from '@/utils/craForm';

interface UseCraFormProps {
  questions: (CraQuestion)[];
  onHighestRiskChange?: (risk: string | null) => void;
}

interface UseCraFormReturn {
  // State
  answers: FormAnswers;
  activeStep: number;
  skippedQuestions: Set<number>;
  selectedAnswer: CraAnswer | null;
  highestRiskLevel: string | null;
  
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

export const useCraForm = ({ questions, onHighestRiskChange }: UseCraFormProps): UseCraFormReturn => {
  const [answers, setAnswers] = useState<FormAnswers>({});
  const [activeStep, setActiveStep] = useState(1);
  const [skippedQuestions, setSkippedQuestions] = useState<Set<number>>(new Set());
  const [highestRiskLevel, setHighestRiskLevel] = useState<string | null>(null);
  const isInitialLoadRef = useRef(true);
  const onHighestRiskChangeRef = useRef(onHighestRiskChange);

  // Update the ref when the callback changes
  useEffect(() => {
    onHighestRiskChangeRef.current = onHighestRiskChange;
  }, [onHighestRiskChange]);

  // Load saved state on mount
  useEffect(() => {
    const savedState = loadFormState();
    
    if (savedState && savedState.completed) {
      // Form was completed, clear all progress and start fresh
      clearFormState();
    } else if (savedState) {
      // Load saved progress if form wasn't completed
      if (savedState.answers) {
        setAnswers(savedState.answers);
        const recalculatedRisk = calculateHighestRiskFromAnswers(savedState.answers);
        setHighestRiskLevel(recalculatedRisk);
        onHighestRiskChangeRef.current?.(recalculatedRisk);
      }
      if (savedState.activeStep) setActiveStep(savedState.activeStep);
      if (savedState.skippedQuestions) {
        setSkippedQuestions(new Set(savedState.skippedQuestions));
      }
    }
    isInitialLoadRef.current = false;
  }, []); 

  // Save state to localStorage whenever it changes (but not during initial load)
  useEffect(() => {
    if (!isInitialLoadRef.current) {
      const state: FormState = {
        answers,
        activeStep,
        skippedQuestions: Array.from(skippedQuestions),
        highestRiskLevel
      };
      saveFormState(state);
    }
  }, [answers, activeStep, skippedQuestions, highestRiskLevel]);

  // Call onHighestRiskChange when highestRiskLevel changes (but not during initial load)
  useEffect(() => {
    if (!isInitialLoadRef.current) {
      onHighestRiskChangeRef.current?.(highestRiskLevel);
    }
  }, [highestRiskLevel]);

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
    
    setAnswers(newAnswers);

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
    setSkippedQuestions(newSkippedQuestions);

    // Recalculate highest risk level
    const newHighestRisk = calculateHighestRiskFromAnswers(newAnswers);
    setHighestRiskLevel(newHighestRisk);
    onHighestRiskChangeRef.current?.(newHighestRisk);
  }, [answers, questions, skippedQuestions]);

  const handleSkip = useCallback((fromStep: number, toStep: number) => {
    const newSkippedQuestions = getSkippedQuestions(fromStep, toStep, skippedQuestions);
    setSkippedQuestions(newSkippedQuestions);
  }, [skippedQuestions]);

  const findPreviousNonSkippedStep = useCallback((currentStep: number): number => {
    return findPreviousStep(currentStep, skippedQuestions);
  }, [skippedQuestions]);

  const clearForm = useCallback(() => {
    clearFormState();
    setAnswers({});
    setActiveStep(1);
    setSkippedQuestions(new Set());
    setHighestRiskLevel(null);
    onHighestRiskChangeRef.current?.(null);
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
