import React, { useCallback } from 'react';
import ProgressBar from './progressBar';
import Step from './step';
import { CraQuestion } from '@oscrat/model';
import data from '@/components/craForm/data.json';
import { CraFormProps } from '@/types/craForm';
import { useCraForm } from '@/hooks/useCraForm';
import { checkIsEliminatory, saveFormState } from '@/utils/craForm';

const CraForm: React.FC<CraFormProps> = ({
  setIsNotEligible,
  setShowResult,
  setHighestRisk,
  onFormCompleted,
  initialFormState,
}) => {
  const allQuestions: CraQuestion[] = data.applicabilityQuestions;
  const TOTAL_QUESTIONS = allQuestions.length;

  const {
    answers,
    activeStep,
    selectedAnswer,
    highestRiskLevel,
    skippedQuestions,
    handleAnswerChange,
    setActiveStep,
    handleSkip,
    findPreviousNonSkippedStep,
  } = useCraForm({
    questions: allQuestions,
    onHighestRiskChange: setHighestRisk,
    initialFormState: initialFormState || null,
  });

  const handleNext = useCallback(() => {
    const currentQuestion = allQuestions[activeStep - 1];
    const currentAnswer = answers[currentQuestion.id];

    if (!currentAnswer) return;

    const isEliminatory = checkIsEliminatory(
      currentQuestion,
      currentAnswer.answer.text
    );

    if (isEliminatory) {
      setIsNotEligible(true);
      setShowResult(true);
      return;
    }

    if (activeStep === TOTAL_QUESTIONS) {
      setIsNotEligible(false);
      setHighestRisk(highestRiskLevel);
      setShowResult(true);

      const completedState = {
        answers,
        activeStep,
        skippedQuestions: Array.from(skippedQuestions),
        highestRiskLevel,
        completed: true,
        completedAt: new Date().toISOString(),
      };

      // Save to localStorage for temporary storage until product is created
      saveFormState(completedState);

      onFormCompleted?.(completedState);
    } else {
      setActiveStep(activeStep + 1);
    }
  }, [
    activeStep,
    allQuestions,
    answers,
    highestRiskLevel,
    skippedQuestions,
    setActiveStep,
    setIsNotEligible,
    setShowResult,
    setHighestRisk,
    onFormCompleted,
    TOTAL_QUESTIONS,
  ]);

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      <ProgressBar total={TOTAL_QUESTIONS} step={activeStep} />

      {allQuestions.map((step, index) => {
        const stepNumber = index + 1;
        const isActive = stepNumber === activeStep;

        if (!isActive) return null;

        return (
          <Step
            key={`${step.id}-${activeStep}`}
            step={step}
            allSteps={allQuestions}
            activeStep={activeStep}
            total={TOTAL_QUESTIONS}
            setStep={setActiveStep}
            onAnswerChange={handleAnswerChange}
            selectedAnswer={selectedAnswer}
            onNext={handleNext}
            onSkip={handleSkip}
            findPreviousNonSkippedStep={findPreviousNonSkippedStep}
          />
        );
      })}
    </div>
  );
};

export default CraForm;
