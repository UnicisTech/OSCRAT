export type ApplicabilityQuestion = {
  id: string;
  question: string;
  hint?: string;
  remark?: string;
  references?: Reference[];
  answerOptions: ApplicabilityAnswer[];
};

export type ApplicabilityAnswer = {
  text: string;
  isEliminatory: boolean;
  skipToQuestion?: string;
};

export type RiskQuestion = {
  id: string;
  question: string;
  answerType?: string;
  references?: Reference[];
  answerOptions: RiskAnswer[];
};

export type RiskAnswer = {
  text: string;
  riskLevel?: string;
  hint?: string;
  references?: Reference[];
  skipToQuestion?: string;
};

export type CraAnswer = ApplicabilityAnswer | RiskAnswer;

export type CraQuestion = ApplicabilityQuestion | RiskQuestion;

export type Reference = {
  text: string;
  url: string;
};

export type Step = ApplicabilityQuestion | RiskQuestion;

export type StepProps = {
  step: Step;
  allSteps: Step[];
  activeStep: number;
  total: number;
  setStep: (step: number) => void;
  onAnswerChange: (step: Step, answer: string, answerObject: RiskAnswer | ApplicabilityAnswer) => void;
  selectedAnswer: RiskAnswer | ApplicabilityAnswer | null;
  onNext: () => void;
  onSkip?: (fromStep: number, toStep: number) => void;
  findPreviousNonSkippedStep?: (currentStep: number) => number;
};

export type ResultProps = {
  isEligible: boolean;
  onTryAgain?: () => void;
  highestRiskLevel?: string | null;
  teamSlug?: string;
};

export type CraFormProps = {
  questions: ApplicabilityQuestion[] | RiskQuestion[];
  activeStep: number;
  setActiveStep: (step: number) => void;
  answers: ApplicabilityAnswer[] | RiskAnswer[];
  onAnswerChange: (stepId: number, answer: string) => void;
  onComplete: () => void;
  total: number;
};

export type ProgressBarProps = {
  step: number;
  total: number;
};
