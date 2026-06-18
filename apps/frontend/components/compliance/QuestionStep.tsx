import React, { useState, useEffect } from 'react';
import { useTranslation } from 'next-i18next';
import { ComplianceQuestion, ComplianceAnswer } from '@/types/compliance';
import {
  ComplianceNamespace,
  createComplianceTranslator,
} from '@/lib/compliance/translations';
import { FaUpload, FaFile, FaTimes, FaInfoCircle } from 'react-icons/fa';
import { Button } from '@/components/shared';

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

const MAX_EVIDENCE_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
const EVIDENCE_ALLOWED_EXTENSIONS = new Set([
  'pdf',
  'doc',
  'docx',
  'txt',
  'csv',
  'json',
  'xml',
  'yml',
  'yaml',
  'zip',
  'tar',
  'gz',
  'tgz',
  'png',
  'jpg',
  'jpeg',
  'gif',
]);
const BLOCKED_EXTENSIONS = new Set([
  'exe',
  'bat',
  'cmd',
  'com',
  'msi',
  'scr',
  'pif',
  'vbs',
  'vbe',
  'js',
  'jse',
  'ws',
  'wsf',
  'wsc',
  'wsh',
  'ps1',
  'ps2',
  'psc1',
  'psc2',
  'reg',
  'inf',
  'lnk',
  'dll',
  'sys',
  'sh',
  'cpl',
  'hta',
]);
const EVIDENCE_FILE_ACCEPT =
  '.pdf,.doc,.docx,.txt,.csv,.json,.xml,.yml,.yaml,.zip,.tar,.gz,.tgz,.png,.jpg,.jpeg,.gif';

const getFileExtension = (fileName: string): string | null => {
  const lastDotIndex = fileName.lastIndexOf('.');
  if (lastDotIndex !== -1 && lastDotIndex < fileName.length - 1) {
    return fileName.substring(lastDotIndex + 1).toLowerCase();
  }
  return null;
};

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
  const tr = createComplianceTranslator(
    t,
    complianceNamespace,
    customTranslations
  );

  const getInitialAnswer = () => {
    if (existingAnswer?.answer !== undefined) {
      return existingAnswer.answer;
    }
    return question.answerType === 'boolean' ? null : '';
  };

  const [answer, setAnswer] = useState<string | boolean | null>(
    getInitialAnswer()
  );
  const [additionalInformation, setAdditionalInformation] = useState<string>(
    existingAnswer?.additionalInformation || ''
  );
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
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
      setFileError(null);
      setHasExistingEvidence(false);
    }
  }, [existingAnswer, question.questionId, question.answerType]);

  const handleSubmit = () => {
    if (!answer && answer !== false) return;

    const complianceAnswer: ComplianceAnswer = {
      questionId: question.questionId,
      answer,
      additionalInformation: additionalInformation || undefined,
      evidence:
        evidenceFile || (hasExistingEvidence ? existingAnswer?.evidence : null),
      evidenceFileName: evidenceFile?.name || existingAnswer?.evidenceFileName,
    };

    onSubmit(complianceAnswer);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    const extension = getFileExtension(file.name);
    if (
      !extension ||
      BLOCKED_EXTENSIONS.has(extension) ||
      !EVIDENCE_ALLOWED_EXTENSIONS.has(extension)
    ) {
      setFileError(t('oscrat.ui.file-upload-allowed-types'));
      e.target.value = '';
      return;
    }

    if (file.size > MAX_EVIDENCE_FILE_SIZE_BYTES) {
      setFileError(t('oscrat.ui.file-upload-max-size'));
      e.target.value = '';
      return;
    }

    setFileError(null);
    setEvidenceFile(file);
    setHasExistingEvidence(false);
  };

  const removeFile = () => {
    setEvidenceFile(null);
    setFileError(null);
    setHasExistingEvidence(false);
  };

  const isEvidenceRequiredForCurrentAnswer = (): boolean => {
    if (!question.evidence?.required) {
      return false;
    }

    if (question.answerType === 'boolean') {
      return answer === true;
    }

    return true;
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
                className="border-line hover:bg-surface-muted rounded-input flex cursor-pointer items-center border p-3 transition-colors"
              >
                <input
                  type="radio"
                  name={`question-${question.questionId}`}
                  value={String(booleanValue)}
                  checked={answer === booleanValue}
                  onChange={() => setAnswer(booleanValue)}
                  className="text-primary mr-3"
                />
                <span className="text-content-secondary">{tr(option)}</span>
              </label>
            );
          })}
        </div>
      );
    }

    if (question.answerType === 'text') {
      const textValue = typeof answer === 'string' ? answer : '';
      const charCount = textValue.length;
      const MAX_CHARS = 1000;

      return (
        <div>
          <textarea
            value={textValue}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder={t('oscrat.ui.enter-your-answer')}
            className="border-line focus:ring-primary focus:border-primary rounded-input min-h-[120px] w-full resize-y border p-3 focus:outline-none focus:ring-2"
            rows={4}
            maxLength={MAX_CHARS}
          />
          <div className="mt-1 flex justify-end">
            <span
              className={`text-c1 ${charCount >= MAX_CHARS ? 'text-danger' : 'text-content-muted'}`}
            >
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
    const hasValidAnswer =
      question.answerType === 'boolean'
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
    if (
      isEvidenceRequiredForCurrentAnswer() &&
      !evidenceFile &&
      !hasExistingEvidence
    ) {
      return false;
    }

    return true;
  };

  return (
    <div className="bg-surface border-line rounded-card border p-6">
      {/* Question header */}
      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-b2 text-content-muted">
            {t('oscrat.ui.question-n-of-m', {
              current: questionNumber,
              total: totalQuestions,
            })}
          </span>
        </div>
        <h3 className="text-h6 text-content font-medium">
          {tr(question.questionText)}
        </h3>
      </div>

      {/* Answer input */}
      <div className="mb-6">{renderAnswerInput()}</div>

      {/* Additional Information */}
      {question.additionalInformation && (
        <div className="mb-6">
          <label className="text-b2 text-content-secondary mb-2 block font-medium">
            {t('oscrat.ui.additional-information')}
            {question.additionalInformation.required && (
              <span className="text-danger ml-1">*</span>
            )}
          </label>
          <textarea
            value={additionalInformation}
            onChange={(e) => setAdditionalInformation(e.target.value)}
            placeholder={t('oscrat.ui.enter-additional-information')}
            className="border-line focus:ring-primary focus:border-primary rounded-input min-h-[100px] w-full resize-y border p-3 focus:outline-none focus:ring-2"
            rows={3}
            maxLength={1000}
          />
          <div className="mt-1 flex justify-end">
            <span
              className={`text-c1 ${additionalInformation.length >= 1000 ? 'text-danger' : 'text-content-muted'}`}
            >
              {additionalInformation.length} / 1000
            </span>
          </div>
        </div>
      )}

      {/* Evidence upload */}
      {question.evidence && (
        <div className="bg-surface-muted rounded-card mb-6 p-4">
          <div className="mb-2 flex items-center gap-2">
            <label className="text-b2 text-content-secondary block font-medium">
              {t('oscrat.ui.evidence-upload')}
              {isEvidenceRequiredForCurrentAnswer() && (
                <span className="text-danger ml-1">*</span>
              )}
              {question.evidence.hint && (
                <span className="text-c1 text-content-muted ml-2 font-normal">
                  ({question.evidence.hint})
                </span>
              )}
            </label>
            <div
              className="tooltip tooltip-right"
              data-tip={`${t('oscrat.ui.file-upload-max-size')} • ${t('oscrat.ui.file-upload-allowed-types')}`}
            >
              <FaInfoCircle className="text-content-placeholder hover:text-content-secondary h-4 w-4" />
            </div>
          </div>

          {!evidenceFile && !hasExistingEvidence ? (
            <div className="mt-2">
              <label className="border-line shadow-2 text-b2 text-content-secondary bg-surface hover:bg-surface-muted focus-within:ring-primary rounded-input inline-flex cursor-pointer items-center border px-4 py-2 font-medium focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2">
                <FaUpload className="mr-2" />
                {t('oscrat.ui.select-file')}
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="sr-only"
                  accept={EVIDENCE_FILE_ACCEPT}
                />
              </label>
              {fileError && (
                <p className="text-c1 text-danger mt-2">{fileError}</p>
              )}
            </div>
          ) : (
            <div className="bg-surface border-line-subtle rounded-input mt-2 flex items-center justify-between border p-3">
              <div className="flex items-center">
                <FaFile className="text-content-placeholder mr-2" />
                <span className="text-b2 text-content-secondary">
                  {evidenceFile?.name ||
                    existingAnswer?.evidenceFileName ||
                    t('oscrat.ui.existing-evidence')}
                </span>
              </div>
              <Button
                variant="tertiary"
                tone="danger"
                size="s"
                onClick={removeFile}
                aria-label={t('remove')}
                icon={<FaTimes />}
              />
            </div>
          )}
        </div>
      )}

      {/* Navigation buttons */}
      <div className="flex justify-between">
        <Button
          variant="secondary"
          onClick={onPrevious}
          text={isFirst ? t('back') : t('previous')}
        />

        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={!isAnswerValid()}
          text={isLast ? t('oscrat.ui.complete-requirement') : t('next')}
        />
      </div>
    </div>
  );
};

export default QuestionStep;
