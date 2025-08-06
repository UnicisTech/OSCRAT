import ProgressBar from './progressBar';
import Step from './step';
import { CraFormProps } from '@oscrat/model';

export default function CraForm({
  questions,
  activeStep,
  setActiveStep,
  answers,
  onAnswerChange,
  onComplete,
  total,
}: CraFormProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '40px',
      }}
    >
      <ProgressBar total={total} step={activeStep} />

      {questions?.map((step) => {
        const isActive = step.id === activeStep;

        if (!isActive) {
          return null;
        }

        return (
          <Step
            key={step.id}
            step={step}
            activeStep={activeStep}
            total={total}
            setStep={setActiveStep}
            onAnswerChange={onAnswerChange}
            selectedAnswer={answers[step.id]?.[0] || null}
            onComplete={onComplete}
          />
        );
      })}
    </div>
  );
}
