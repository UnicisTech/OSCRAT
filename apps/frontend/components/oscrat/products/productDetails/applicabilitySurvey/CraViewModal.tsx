import React from 'react';
import { useTranslation } from 'next-i18next';
import type { OscratAssessmentDetail } from '@oscrat/model';
import type { FormAnswers } from '@/types/craForm';
import data from '@/components/craForm/data.json';
import Button from '@/components/button';
import Modal from '@/components/shared/Modal';

interface CraViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  assessment: OscratAssessmentDetail | null;
}

const CraViewModal: React.FC<CraViewModalProps> = ({
  isOpen,
  onClose,
  assessment,
}) => {
  const { t, ready } = useTranslation('common');

  if (!isOpen || !ready) {
    return null;
  }

  // Extract data from assessment rawData
  const rawData = assessment?.rawData as
    | {
        questionnaire_results?: {
          answers?: FormAnswers;
          skippedQuestions?: number[];
        };
      }
    | undefined;
  const answers = rawData?.questionnaire_results?.answers || {};
  const skippedQuestions =
    rawData?.questionnaire_results?.skippedQuestions || [];

  // Combine all questions in order
  const allQuestions = [...data.applicabilityQuestions, ...data.riskQuestions];

  // Build content for display - include both answered and skipped questions
  const content = allQuestions.flatMap((q, index) => {
    const stepNumber = index + 1; // 1-based step number
    const answerData = answers[q.id];
    const wasSkipped = skippedQuestions.includes(stepNumber);

    // Include question if it has an answer OR was skipped
    if (answerData || wasSkipped) {
      const answerText = answerData
        ? typeof answerData.answer === 'string'
          ? answerData.answer
          : answerData.answer.text || ''
        : null;

      return [
        {
          questionId: q.id, // Use the actual question ID (e.g., "1.1", "1.2")
          question: q.question,
          answer: answerText,
          isSkipped: wasSkipped && !answerData, // True if skipped and no answer
        },
      ];
    }

    return [];
  });

  if (content.length === 0) {
    return null;
  }

  return (
    <Modal open={isOpen} close={onClose} size="xl">
      <Modal.Header>{t('oscrat.ui.cra-survey')}</Modal.Header>
      <Modal.Body>
        {content.map((item, index) => (
          <div key={item.questionId}>
            <p className="text-content mb-1 font-semibold">
              {index + 1}. {item.question}
            </p>
            {item.isSkipped ? (
              <p className="border-warning-border text-content-muted border-l-2 pl-4 italic">
                <span className="font-medium">{t('oscrat.ui.skipped')}</span> —{' '}
                {t('oscrat.ui.question-skipped-during-survey')}
              </p>
            ) : (
              <p className="border-line-subtle text-content-secondary border-l-2 pl-4">
                {item.answer}
              </p>
            )}
          </div>
        ))}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={onClose} text={t('close')} />
      </Modal.Footer>
    </Modal>
  );
};

export default CraViewModal;
