export type Answer = {
  text: string;
  isEliminatory: boolean;
};

export type Answers = {
  [key: string]: [string | null, boolean?];
};

export type Question = {
  id: number;
  question: string;
  answers: Answer[];
};

type Step = {
  id: number;
  question: string;
  answers: {
    text: string;
    isEliminatory: boolean;
  }[];
};

export type StepProps = {
  step: Step;
  activeStep: number;
  total: number;
  setStep: (step: number) => void;
  onAnswerChange: (stepId: number, answer: string) => void;
  selectedAnswer: string | null;
  onComplete: () => void;
};

export type ResultProps = {
  isEligible: boolean;
  teamSlug: string;
  projectId: string;
};

export type CraFormProps = {
  questions: Question[];
  activeStep: number;
  setActiveStep: (step: number) => void;
  answers: Answers;
  onAnswerChange: (stepId: number, answer: string) => void;
  onComplete: () => void;
  total: number;
};

export type ProgressBarProps = {
  step: number;
  total: number;
};
