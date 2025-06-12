import Button from '@/components/button';
import { StepProps } from '@/types/oscrat/craForm/form';

export default function Step({
  step,
  activeStep,
  total,
  setStep,
  onAnswerChange,
  selectedAnswer,
  onComplete,
}: StepProps) {
  const { id, question, answers } = step;

  const handleNext = () => {
    if (!selectedAnswer) {
      alert('Please select an answer.');
      return;
    }

    const isEliminatory =
      step.answers.find((a) => a.text === selectedAnswer)?.isEliminatory ||
      false;
    if (isEliminatory || activeStep === total) {
      onComplete();
      return;
    }

    // If not eliminatory and not the last step, proceed to the next step
    setStep(activeStep + 1);
  };

  const handleBack = () => {
    setStep(activeStep - 1);
  };

  const handleClose = () => {
    console.log('Close button pressed');
    // Add the closing logic
  };

  const handleAnswerSelect = (answerText: string) => {
    onAnswerChange(id, answerText);
  };

  return (
    <div>
      <p className="text-[16px] font-semibold">
        {activeStep}. {question}
      </p>

      <div className="my-4 flex flex-col gap-2">
        {answers.map((answer, index) => (
          <div key={index}>
            <input
              type="radio"
              name={`question-${id}`}
              value={answer.text}
              onChange={() => handleAnswerSelect(answer.text)}
              checked={selectedAnswer === answer.text}
              id={`q${id}-ans${index}`}
            />
            <label htmlFor={`q${id}-ans${index}`} className="ml-2">
              {answer.text}
            </label>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        {activeStep === 1 ? (
          <Button onClick={handleClose} text="Close" />
        ) : (
          <Button onClick={handleBack} text="Back" />
        )}
        {activeStep !== total ? (
          <Button onClick={handleNext} variant="primary" text="Next" />
        ) : (
          <Button onClick={handleNext} variant="primary" text="Finish" />
        )}
      </div>
    </div>
  );
}
