import React, { useCallback, useMemo } from 'react';
import Button from '@/components/button';
import { StepProps, RiskAnswer, CraAnswer, ApplicabilityQuestion, RiskQuestion } from '@oscrat/model';
import { useTranslation } from 'next-i18next';
import { isApplicabilityAnswer } from '@/types/craForm';
import { LuInfo } from 'react-icons/lu';
import { getStepNumberById } from '@/utils/craForm';
import Select from '@atlaskit/select';

const Step: React.FC<StepProps> = ({
  step,
  allSteps,
  activeStep,
  total,
  setStep,
  onAnswerChange,
  selectedAnswer,
  onNext,
  onSkip,
  findPreviousNonSkippedStep,
}) => {
  const { t, ready } = useTranslation('common');
  
  const { id, question, answerOptions, references } = step;
  const hint = (step as ApplicabilityQuestion).hint;
  const remark = (step as ApplicabilityQuestion).remark;
  const answerType = (step as RiskQuestion).answerType;
  const isDropdown = answerType === 'DROPDOWN';

  if (!ready) return null;

  const handleNext = useCallback((selectedAnswer: CraAnswer | null) => {
    if (!selectedAnswer) return;

    const isEliminatory = isApplicabilityAnswer(selectedAnswer) ? selectedAnswer.isEliminatory : false;
    const skipToQuestion = selectedAnswer.skipToQuestion;

    // Handle skip logic
    if (skipToQuestion) {
      const targetStep = getStepNumberById(allSteps, skipToQuestion);
      onSkip?.(activeStep, targetStep);
      setStep(targetStep);
      return;
    }

    // Handle eliminatory or final step
    if (isEliminatory || activeStep === total) {
      onNext();
      return;
    }

    // Proceed to next step
    setStep(activeStep + 1);
  }, [activeStep, allSteps, onNext, onSkip, setStep, total]);

  const handleBack = useCallback(() => {
    const previousStep = findPreviousNonSkippedStep ? 
      findPreviousNonSkippedStep(activeStep) : 
      activeStep - 1;
    setStep(previousStep);
  }, [activeStep, findPreviousNonSkippedStep, setStep]);

  const handleAnswerSelect = useCallback((answer: CraAnswer) => {
    // Only update if this is a different answer than currently selected
    if (selectedAnswer?.text !== answer.text) {
      onAnswerChange(step, answer.text, answer);
    }
  }, [onAnswerChange, step, selectedAnswer]);

  const displayProperties = useMemo(() => {
    const selectedRiskAnswer = isDropdown && selectedAnswer && 'riskLevel' in selectedAnswer 
      ? selectedAnswer as RiskAnswer 
      : null;
    
    return {
      hint: selectedRiskAnswer?.hint || hint,
      remark: remark,
      references: selectedRiskAnswer?.references || references
    };
  }, [isDropdown, selectedAnswer, hint, remark, references]);

  const formatQuestion = (text: string) => {
    return text.replace(/\n-\s*/g, '\n• ');
  };

  const renderHintSection = () => {
    const { hint: displayHint, remark: displayRemark, references: displayReferences } = displayProperties;
    
    if (!displayHint && !displayRemark && !displayReferences?.length) {
      return null;
    }

    return (
      <div className="mb-6 w-full rounded-lg border border-blue-300 bg-blue-50 p-4">
        <div className="flex items-start gap-2">
          <LuInfo className="h-6 w-6 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            {(displayHint || displayRemark) && (
              <p className="text-sm text-gray-900 leading-relaxed">
                {displayHint || displayRemark}
              </p>
            )}

            {displayReferences && displayReferences.length > 0 && (
              <>
                {(displayHint || displayRemark) && <div className="h-3" />}
                <div className="text-sm">
                  <span className="text-gray-900">{t('oscrat.ui.references')}: </span>
                  {displayReferences.map((ref, index) => (
                    <span key={`${ref.url}-${index}`}>
                      <a
                        href={ref.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 underline"
                      >
                        {ref.text}
                      </a>
                      {index < displayReferences.length - 1 && ', '}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderAnswerOptions = () => {
    if (isDropdown) {
      const options = answerOptions.map(answer => ({
        value: answer.text,
        label: answer.text,
        answer: answer
      }));

      const selectedOption = selectedAnswer ? {
        value: selectedAnswer.text,
        label: selectedAnswer.text,
        answer: selectedAnswer
      } : null;
      return (
        <div className="my-4" style={{ maxWidth: '400px' }}>
          <Select
            inputId="cra-step-select"
            options={options}
            value={selectedOption}
            onChange={(option) => {
              if (option && option.answer) {
                handleAnswerSelect(option.answer);
              }
            }}
            placeholder={t('select')}
            isClearable={false}
            isSearchable={false}
            classNamePrefix="react-select"
            styles={{
              container: (provided) => ({
                ...provided,
                width: '100%'
              }),
              control: (provided) => ({
                ...provided,
                minHeight: '42px'
              })
            }}
          />
        </div>
      );
    }

    return (
      <div className="my-4 flex flex-col gap-2" role="radiogroup" aria-label={question}>
        {answerOptions.map((answer, index) => {
          const inputId = `q${id}-ans${index}`;
          return (
            <div key={answer.text}>
              <input
                type="radio"
                name={`question-${id}`}
                value={answer.text}
                onChange={() => handleAnswerSelect(answer)}
                checked={selectedAnswer?.text === answer.text}
                id={inputId}
                aria-describedby={answer.text}
              />
              <label htmlFor={inputId} className="ml-2 text-gray-900 text-sm cursor-pointer">
                {answer.text}
              </label>
            </div>
          );
        })}
      </div>
    );
  };

  const renderNavigationButtons = () => (
    <div className="flex gap-2">
      {activeStep === 1 ? (
        <Button onClick={handleBack} text={t('close')} />
      ) : (
        <Button onClick={handleBack} text={t('back')} />
      )}
      <Button 
        onClick={() => handleNext(selectedAnswer)} 
        variant="primary" 
        text={activeStep !== total ? t('oscrat.ui.next') : t('oscrat.ui.finish')} 
        disabled={!selectedAnswer}
      />
    </div>
  );

  return (
    <div className="rounded-lg border border-gray-300 p-6">
      {renderHintSection()}

      <p className="mb-4 text-lg font-semibold text-gray-900 whitespace-pre-line">
        {activeStep}. {formatQuestion(question)}
      </p>

      {renderAnswerOptions()}
      {renderNavigationButtons()}
    </div>
  );
};

export default Step;