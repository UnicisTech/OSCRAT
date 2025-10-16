import React, { useState, useEffect } from 'react';
import { useTranslation } from 'next-i18next';
import { 
  ComplianceArea, 
  ComplianceRequirement, 
  RequirementAssessment,
  ComplianceAnswer,
  ComplianceStatus
} from '@/types/compliance';
import { ComplianceNamespace } from '@/lib/compliance/translations';
import { QuestionStep, ComplianceStatusSelector } from '@/components/compliance';
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
}) => {
  const { t, ready } = useTranslation(['common', complianceNamespace]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<ComplianceAnswer[]>(() => 
    existingAssessment?.requirementId === requirement.reqId 
      ? existingAssessment.answers 
      : []
  );
  const [complianceStatus, setComplianceStatus] = useState<ComplianceStatus | undefined>(
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
  const isLastQuestion = currentQuestionIndex === requirement.questions.length - 1;
  const progress = ((currentQuestionIndex + 1) / requirement.questions.length) * 100;

  if (!currentQuestion) return null;

  const handleAnswerSubmit = (answer: ComplianceAnswer) => {
    const newAnswers = [...answers];
    const existingIndex = newAnswers.findIndex(a => a.questionId === answer.questionId);
    
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
      requirementText: t(requirement.requirement, { ns: complianceNamespace }),
      areaId: area.id,
      areaText: t(area.areaOfRequirements, { ns: complianceNamespace }),
      answers,
      complianceStatus: status,
      assessedAt: new Date().toISOString(),
    };
    
    onComplete(assessment);
  };

  const getExistingAnswer = (questionId: string): ComplianceAnswer | undefined => {
    return answers.find(a => a.questionId === questionId);
  };

  if (!ready || !currentQuestion) return null;

  if (showStatusSelection) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">
            {t('oscrat.ui.requirement-assessment-complete')}
          </h2>
          
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-700 mb-2">{t(requirement.requirement, { ns: complianceNamespace })}</h3>
            <p className="text-sm text-gray-600">
              {t('oscrat.ui.answered-all-questions', { count: requirement.questions.length })}
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
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-semibold text-gray-800">
            {t(area.areaOfRequirements, { ns: complianceNamespace })}
          </h2>
          <span className="text-sm text-gray-600">
            {t('oscrat.ui.requirement-n-of-m', { 
              current: requirementIndex + 1, 
              total: totalRequirements 
            })}
          </span>
        </div>
        
        {/* Progress bar for questions */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Requirement info card */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {t(requirement.requirement, { ns: complianceNamespace })}
            </h3>
            <p className="text-sm text-gray-500">
              {t('oscrat.ui.cra-reference')}: {requirement.craReference}
            </p>
          </div>
          <button
            onClick={() => setShowHint(!showHint)}
            className="ml-4 p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            aria-label={t('oscrat.ui.toggle-hint')}
          >
            <LuInfo className="text-xl" />
          </button>
        </div>

        {showHint && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            {requirement.hint && (
              <>
                <h4 className="font-medium text-blue-900 mb-2">{t('oscrat.ui.hint')}</h4>
                <p className="text-sm text-blue-800 leading-relaxed">{t(requirement.hint, { ns: complianceNamespace })}</p>
              </>
            )}
            {requirement.genericTask && (
              <div className={requirement.hint ? "mt-3 pt-3 border-t border-blue-200" : ""}>
                <h5 className="text-xs font-medium text-blue-700 uppercase tracking-wide mb-1">
                  {t('oscrat.ui.generic-task')}
                </h5>
                <p className="text-sm text-blue-800">{requirement.genericTask}</p>
              </div>
            )}
            {!requirement.hint && !requirement.genericTask && (
              <p className="text-sm text-gray-600 italic">{t('oscrat.ui.no-additional-info')}</p>
            )}
          </div>
        )}
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
      />
    </div>
  );
};

export default RequirementQuestionnaire;
