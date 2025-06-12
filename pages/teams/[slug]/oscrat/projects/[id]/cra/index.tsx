import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import CraForm from '@/components/craForm';
import Result from '@/components/craForm/result';
import steps from '@/components/craForm/questions';
import { Answers } from '@/types/oscrat/craForm/form';

export default function FormPage() {
  const router = useRouter();
  const { slug, id } = router.query;

  const [activeStep, setActiveStep] = useState(1);
  const [answers, setAnswers] = useState<Answers>({});
  const [showResult, setShowResult] = useState(false);
  const [isEligible, setIsEligible] = useState(false);
  const TOTAL_QUESTIONS = steps.length;

  // Initialize null answers based on number of mock steps
  useEffect(() => {
    const initialNullAnswers: Answers = {};
    steps.forEach((question) => {
      initialNullAnswers[question.id] = [null];
    });
    setAnswers(initialNullAnswers);
  }, []);

  const handleAnswerChange = (stepId: number, answer: string) => {
    // Identify if the selected answer is eliminatory
    const questionObj = steps.find((q) => q.id === stepId);
    const selectedAnswer = questionObj?.answers.find((a) => a.text === answer);
    const isEliminatory = selectedAnswer?.isEliminatory || false;

    const newAnswers = {
      ...answers,
      [stepId]: [answer, isEliminatory],
    };

    setAnswers(newAnswers);
    // API call here to save the progress
  };

  const handleComplete = () => {
    // Check if an eliminatory answer has been selected
    const foundEliminatory = Object.values(answers).some(
      ([_, isEliminatory]) => isEliminatory
    );

    setIsEligible(foundEliminatory);
    setShowResult(true);
    console.log('Assessment complete:', answers, 'Eligible:', foundEliminatory);
    // API call here to save the final result
  };

  // Check if we need to show the result (if the assessment is complete)
  useEffect(() => {
    const allAnswered = steps.every(
      (q) => answers[q.id] && answers[q.id][0] !== null
    );

    if (allAnswered && activeStep > TOTAL_QUESTIONS) {
      handleComplete();
    }
  }, [activeStep, answers]);

  if (showResult) {
    return (
      <Result
        isEligible={isEligible}
        teamSlug={slug as string}
        projectId={id as string}
      />
    );
  }

  return (
    <CraForm
      questions={steps}
      activeStep={activeStep}
      setActiveStep={setActiveStep}
      answers={answers}
      onAnswerChange={handleAnswerChange}
      onComplete={handleComplete}
      total={TOTAL_QUESTIONS}
    />
  );
}
