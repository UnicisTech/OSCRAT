import React, { useState, useEffect } from 'react';
import { useTranslation } from 'next-i18next';
import { ComplianceQuestion, ComplianceAnswer } from '@/types/compliance';
import { ComplianceNamespace, createComplianceTranslator } from '@/lib/compliance/translations';
import { FaUpload, FaFile, FaTimes, FaInfoCircle } from 'react-icons/fa';

interface QuestionStepProps {
  question: ComplianceQuestion;
  questionNumber: number;
  totalQuestions: number;
  existingAnswer?: ComplianceAnswer;
  onSubmit: (answer: ComplianceAnswer) => void;
  onPrevious: () => void;
  isFirst: boolean;
  isLast: boolean;
  complianceNamespace: ComplianceNamespace;
  customTranslations?: Record<string, string> | null;
}

const QuestionStep: React.FC<QuestionStepProps> = ({
  question,
  questionNumber,
  totalQuestions,
  existingAnswer,
  onSubmit,
  onPrevious,
  isFirst,
  isLast,
  complianceNamespace,
  customTranslations = null,
}) => {
  const { t, ready } = useTranslation(['common', complianceNamespace]);
  const tr = createComplianceTranslator(t, complianceNamespace, customTranslations);

  const getInitialAnswer = () => {
    if (existingAnswer?.answer !== undefined) {
      return existingAnswer.answer;
    }
    return question.answerType === 'boolean' ? null : '';
  };

  const [answer, setAnswer] = useState<string | boolean | null>(getInitialAnswer());
  const [additionalInformation, setAdditionalInformation] = useState<string>(
    existingAnswer?.additionalInformation || ''
  );
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
  const [hasExistingEvidence, setHasExistingEvidence] = useState(
    !!existingAnswer?.evidence
  );

  useEffect(() => {
    // Reset state when question changes
    if (existingAnswer && existingAnswer.questionId === question.questionId) {
      setAnswer(existingAnswer.answer);
      setAdditionalInformation(existingAnswer.additionalInformation || '');
      setHasExistingEvidence(!!existingAnswer.evidence);
    } else {
      setAnswer(question.answerType === 'boolean' ? null : '');
      setAdditionalInformation('');
      setEvidenceFile(null);
      setHasExistingEvidence(false);
    }
  }, [existingAnswer, question.questionId, question.answerType]);

  const handleSubmit = () => {
    if (!answer && answer !== false) return;

    const complianceAnswer: ComplianceAnswer = {
      questionId: question.questionId,
      answer,
      additionalInformation: additionalInformation || undefined,
      evidence: evidenceFile || (hasExistingEvidence ? existingAnswer?.evidence : null),
    };

    onSubmit(complianceAnswer);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setEvidenceFile(file);
      setHasExistingEvidence(false);
    }
  };

  const removeFile = () => {
    setEvidenceFile(null);
    setHasExistingEvidence(false);
  };

  if (!ready) return null;

  const renderAnswerInput = () => {
    if (question.answerType === 'boolean' && question.options) {
      return (
        <div className="space-y-3">
          {question.options.map((option, index) => {
            const booleanValue = index === 0;
            return (
              <label
                key={option}
                className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <input
                  type="radio"
                  name={`question-${question.questionId}`}
                  value={String(booleanValue)}
                  checked={answer === booleanValue}
                  onChange={() => setAnswer(booleanValue)}
                  className="mr-3 text-blue-600 "
                />
                <span className="text-gray-700">{tr(option)}</span>
              </label>
            );
          })}
        </div>
      );
    }

    if (question.answerType === 'text') {
      const charCount = (answer as string).length;
      const MAX_CHARS = 1000;
      
      return (
        <div>
          <textarea
            value={answer as string}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder={t('oscrat.ui.enter-your-answer')}
            className="w-full p-3 border border-gray-300 rounded-lg min-h-[120px] resize-y focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows={4}
            maxLength={MAX_CHARS}
          />
          <div className="flex justify-end mt-1">
            <span className={`text-xs ${charCount >= MAX_CHARS ? 'text-red-600' : 'text-gray-500'}`}>
              {charCount} / {MAX_CHARS}
            </span>
          </div>
        </div>
      );
    }

    return null;
  };

  const isAnswerValid = () => {
    // Check main answer
    const hasValidAnswer = question.answerType === 'boolean'
      ? answer === true || answer === false
      : answer && typeof answer === 'string' && answer.trim().length > 0;
    
    if (!hasValidAnswer) return false;
    
    // Check additional information if required
    if (
      question.additionalInformation?.required &&
      (!additionalInformation || additionalInformation.trim().length === 0)
    ) {
      return false;
    }
    
    // Check evidence upload if required
    if (question.evidence?.required && !evidenceFile && !hasExistingEvidence) {
      return false;
    }
    
    return true;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Question header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-500">
            {t('oscrat.ui.question-n-of-m', { 
              current: questionNumber, 
              total: totalQuestions 
            })}
          </span>
        </div>
        <h3 className="text-lg font-medium text-gray-900">
          {tr(question.questionText)}
        </h3>
      </div>

      {/* Answer input */}
      <div className="mb-6">
        {renderAnswerInput()}
      </div>

      {/* Additional Information */}
      {question.additionalInformation && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('oscrat.ui.additional-information')}
            {question.additionalInformation.required && <span className="text-red-600 ml-1">*</span>}
          </label>
          <textarea
            value={additionalInformation}
            onChange={(e) => setAdditionalInformation(e.target.value)}
            placeholder={t('oscrat.ui.enter-additional-information')}
            className="w-full p-3 border border-gray-300 rounded-lg min-h-[100px] resize-y focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows={3}
            maxLength={1000}
          />
          <div className="flex justify-end mt-1">
            <span className={`text-xs ${additionalInformation.length >= 1000 ? 'text-red-600' : 'text-gray-500'}`}>
              {additionalInformation.length} / 1000
            </span>
          </div>
        </div>
      )}

      {/* Evidence upload */}
      {question.evidence && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <label className="block text-sm font-medium text-gray-700">
              {t('oscrat.ui.evidence-upload')}
              {question.evidence.required && <span className="text-red-600 ml-1">*</span>}
              {question.evidence.hint && (
                <span className="ml-2 text-xs text-gray-500 font-normal">
                  ({question.evidence.hint})
                </span>
              )}
            </label>
            <div
              className="tooltip tooltip-right"
              data-tip={`${t('oscrat.ui.file-upload-max-size')} • ${t('oscrat.ui.file-upload-allowed-types')}`}
            >
              <FaInfoCircle className="h-4 w-4 text-gray-400 hover:text-gray-600" />
            </div>
          </div>
          
          {!evidenceFile && !hasExistingEvidence ? (
            <div className="mt-2">
              <label className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                <FaUpload className="mr-2" />
                {t('oscrat.ui.select-file')}
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="sr-only"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
                />
              </label>
            </div>
          ) : (
            <div className="mt-2 flex items-center justify-between p-3 bg-white rounded-md border border-gray-200">
              <div className="flex items-center">
                <FaFile className="text-gray-400 mr-2" />
                <span className="text-sm text-gray-700">
                  {evidenceFile?.name || t('oscrat.ui.existing-evidence')}
                </span>
              </div>
              <button
                onClick={removeFile}
                className="text-red-600 hover:text-red-700"
                aria-label={t('remove')}
              >
                <FaTimes />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Navigation buttons */}
      <div className="flex justify-between">
        <button
          onClick={onPrevious}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {isFirst ? t('back') : t('previous')}
        </button>
        
        <button
          onClick={handleSubmit}
          disabled={!isAnswerValid()}
          className={`
            px-4 py-2 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
            ${isAnswerValid()
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }
          `}
        >
          {isLast ? t('oscrat.ui.complete-requirement') : t('next')}
        </button>
      </div>
    </div>
  );
};

export default QuestionStep;
