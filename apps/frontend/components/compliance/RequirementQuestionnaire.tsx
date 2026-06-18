import React, { useState, useEffect } from 'react';
import { useTranslation } from 'next-i18next';
import {
  ComplianceArea,
  ComplianceRequirement,
  RequirementAssessment,
  ComplianceAnswer,
  ComplianceStatus,
} from '@/types/compliance';
import {
  ComplianceNamespace,
  createComplianceTranslator,
} from '@/lib/compliance/translations';
import {
  QuestionStep,
  ComplianceStatusSelector,
} from '@/components/compliance';
import { LuInfo } from 'react-icons/lu';

interface RequirementQuestionnaireProps {
  area: ComplianceArea;
  requirement: ComplianceRequirement;
  requirementIndex: number;
  totalRequirements: number;
  existingAssessment?: RequirementAssessment;
  onComplete: (assessment: RequirementAssessment) => void;
  onBack: () => void;
  complianceNamespace: ComplianceNamespace;
  customTranslations?: Record<string, string> | null;
}

const RequirementQuestionnaire: React.FC<RequirementQuestionnaireProps> = ({
  area,
  requirement,
  requirementIndex,
  totalRequirements,
  existingAssessment,
  onComplete,
  onBack,
  complianceNamespace,
  customTranslations = null,
}) => {
  const { t, ready } = useTranslation(['common', complianceNamespace]);
  const tr = createComplianceTranslator(
    t,
    complianceNamespace,
    customTranslations
  );
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<ComplianceAnswer[]>(() =>
    existingAssessment?.requirementId === requirement.reqId
      ? existingAssessment.answers
      : []
  );
  const [complianceStatus, setComplianceStatus] = useState<
    ComplianceStatus | undefined
  >(
    existingAssessment?.requirementId === requirement.reqId
      ? existingAssessment.complianceStatus
      : undefined
  );
  const [showStatusSelection, setShowStatusSelection] = useState(false);
  const [showHint, setShowHint] = useState(false);

  // Reset state when requirement changes
  useEffect(() => {
    setCurrentQuestionIndex(0);
    setShowStatusSelection(false);
    setShowHint(false);

    // Only use existing answers if they belong to this requirement
    if (existingAssessment?.requirementId === requirement.reqId) {
      setAnswers(existingAssessment.answers);
      setComplianceStatus(existingAssessment.complianceStatus);
    } else {
      setAnswers([]);
      setComplianceStatus(undefined);
    }
  }, [requirement.reqId, existingAssessment?.requirementId]);

  const currentQuestion = requirement.questions[currentQuestionIndex];
  const isLastQuestion =
    currentQuestionIndex === requirement.questions.length - 1;
  const totalQuestions = requirement.questions.length;
  const progress =
    totalQuestions > 0 ? (answers.length / totalQuestions) * 100 : 0;

  if (!currentQuestion) return null;

  const handleAnswerSubmit = (answer: ComplianceAnswer) => {
    const newAnswers = [...answers];
    const existingIndex = newAnswers.findIndex(
      (a) => a.questionId === answer.questionId
    );

    if (existingIndex >= 0) {
      newAnswers[existingIndex] = answer;
    } else {
      newAnswers.push(answer);
    }

    setAnswers(newAnswers);

    if (isLastQuestion) {
      // Show compliance status selection
      setShowStatusSelection(true);
    } else {
      // Move to next question
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    } else {
      onBack();
    }
  };

  const handleStatusSelect = (status: ComplianceStatus) => {
    const assessment: RequirementAssessment = {
      requirementId: requirement.reqId,
      requirementText: tr(requirement.requirement),
      areaId: area.id,
      areaText: tr(area.areaOfRequirements),
      answers,
      complianceStatus: status,
      assessedAt: new Date().toISOString(),
    };

    onComplete(assessment);
  };

  const getExistingAnswer = (
    questionId: string
  ): ComplianceAnswer | undefined => {
    return answers.find((a) => a.questionId === questionId);
  };

  if (!ready || !currentQuestion) return null;

  if (showStatusSelection) {
    return (
      <div className="mx-auto max-w-4xl">
        <div className="bg-surface border-line rounded-card border p-8">
          <h2 className="text-h5 text-content mb-6 font-bold">
            {t('oscrat.ui.requirement-assessment-complete')}
          </h2>

          <div className="bg-surface-muted mb-6 rounded-lg p-4">
            <h3 className="text-content-secondary mb-2 font-medium">
              {tr(requirement.requirement)}
            </h3>
            <p className="text-b2 text-content-secondary">
              {t('oscrat.ui.answered-all-questions', {
                count: requirement.questions.length,
              })}
            </p>
          </div>

          <ComplianceStatusSelector
            onSelect={handleStatusSelect}
            selectedStatus={complianceStatus}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      {/* Header: area + requirement info */}
      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-h5 text-content font-bold">
            {tr(area.areaOfRequirements)}
          </h2>
          <span className="text-b2 text-content-secondary">
            {t('oscrat.ui.requirement-n-of-m', {
              current: requirementIndex + 1,
              total: totalRequirements,
            })}
          </span>
        </div>
      </div>

      {/* Requirement info card */}
      <div className="bg-surface border-line rounded-card mb-6 border p-6">
        <div className="mb-4 flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-h6 text-content mb-2 font-medium">
              {tr(requirement.requirement)}
            </h3>
            <p className="text-b2 text-content-muted">
              {t('oscrat.ui.cra-reference')}: {requirement.craReference}
            </p>
          </div>
          <button
            onClick={() => setShowHint(!showHint)}
            className="text-primary hover:bg-info-subtle ml-4 rounded-lg p-2 transition-colors"
            aria-label={t('oscrat.ui.toggle-hint')}
          >
            <LuInfo className="text-h5" />
          </button>
        </div>

        {showHint && (
          <div className="bg-info-subtle mt-4 rounded-lg p-4">
            {requirement.hint && (
              <>
                <h4 className="text-info-emphasis mb-2 font-medium">
                  {t('oscrat.ui.hint')}
                </h4>
                <p className="text-b2 text-info-emphasis leading-relaxed">
                  {tr(requirement.hint!)}
                </p>
              </>
            )}
            {requirement.genericTask && (
              <div
                className={
                  requirement.hint ? 'border-info mt-3 border-t pt-3' : ''
                }
              >
                <h5 className="text-c1 text-info-emphasis mb-1 font-medium uppercase tracking-wide">
                  {t('oscrat.ui.generic-task')}
                </h5>
                <p className="text-b2 text-info-emphasis">
                  {requirement.genericTask}
                </p>
              </div>
            )}
            {!requirement.hint && !requirement.genericTask && (
              <p className="text-b2 text-content-secondary italic">
                {t('oscrat.ui.no-additional-info')}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Question progress bar */}
      <div className="mb-4">
        <div className="text-b2 mb-1 flex items-center justify-between">
          <span className="text-content-secondary">
            {t('oscrat.ui.questions-progress', {
              answered: answers.length,
              total: totalQuestions,
              remaining: totalQuestions - answers.length,
            })}
          </span>
          <span className="text-content-secondary font-medium">
            {Math.round(progress)}%
          </span>
        </div>
        <div className="bg-surface-muted h-2 w-full rounded-full">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Current question */}
      <QuestionStep
        question={currentQuestion}
        questionNumber={currentQuestionIndex + 1}
        totalQuestions={requirement.questions.length}
        existingAnswer={getExistingAnswer(currentQuestion.questionId)}
        onSubmit={handleAnswerSubmit}
        onPrevious={handlePreviousQuestion}
        isFirst={currentQuestionIndex === 0}
        isLast={isLastQuestion}
        complianceNamespace={complianceNamespace}
        customTranslations={customTranslations}
      />
    </div>
  );
};

export default RequirementQuestionnaire;
