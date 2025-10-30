import React, { useEffect, useRef } from 'react';
import { IoClose } from 'react-icons/io5';
import { useTranslation } from 'next-i18next';
import type { OscratAssessmentDetail } from '@oscrat/model';
import type { FormAnswers } from '@/types/craForm';
import data from '@/components/craForm/data.json';

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
  const modalRef = useRef<HTMLDivElement>(null);
  const { t, ready } = useTranslation('common');

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !ready) {
    return null;
  }

  // Extract data from assessment rawData
  const rawData = assessment?.rawData as { 
    questionnaire_results?: { 
      answers?: FormAnswers;
      skippedQuestions?: number[];
    } 
  } | undefined;
  const answers = rawData?.questionnaire_results?.answers || {};
  const skippedQuestions = rawData?.questionnaire_results?.skippedQuestions || [];

  // Combine all questions in order
  const allQuestions = [
    ...data.applicabilityQuestions,
    ...data.riskQuestions,
  ];

  // Build content for display - include both answered and skipped questions
  const content = allQuestions
    .flatMap((q, index) => {
      const stepNumber = index + 1; // 1-based step number
      const answerData = answers[q.id];
      const wasSkipped = skippedQuestions.includes(stepNumber);
      
      // Include question if it has an answer OR was skipped
      if (answerData || wasSkipped) {
        const answerText = answerData 
          ? (typeof answerData.answer === 'string'
              ? answerData.answer
              : answerData.answer.text || '')
          : null;

        return [{
          questionId: q.id, // Use the actual question ID (e.g., "1.1", "1.2")
          question: q.question,
          answer: answerText,
          isSkipped: wasSkipped && !answerData, // True if skipped and no answer
        }];
      }
      
      return [];
    });

  if (content.length === 0) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 !ml-0 flex items-center justify-center bg-black bg-opacity-60 transition-opacity duration-300">
      <div
        ref={modalRef}
        className="animate-fade-in-up flex max-h-[90vh] w-full max-w-3xl flex-col rounded-lg bg-white shadow-2xl dark:bg-gray-800"
      >
        <header className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {t('oscrat.ui.cra-survey')}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-gray-300"
            aria-label="Close modal"
          >
            <IoClose size={24} />
          </button>
        </header>
        <main className="max-h-[60vh] space-y-5 overflow-y-auto p-6 text-sm">
          {content.map((item, index) => (
            <div key={item.questionId}>
              <p className="mb-1 font-semibold text-gray-900 dark:text-gray-100">
                {index + 1}. {item.question}
              </p>
              {item.isSkipped ? (
                <p className="border-l-2 border-yellow-400 pl-4 italic text-gray-500 dark:border-yellow-600 dark:text-gray-400">
                  <span className="font-medium">{t('oscrat.ui.skipped')}</span> — {t('oscrat.ui.question-skipped-during-survey')}
                </p>
              ) : (
                <p className="border-l-2 border-gray-200 pl-4 text-gray-700 dark:border-gray-600 dark:text-gray-300">
                  {item.answer}
                </p>
              )}
            </div>
          ))}
        </main>
        <footer className="flex items-center justify-end space-x-3 rounded-b-lg border-t border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-700">
          <button
            onClick={onClose}
            className="rounded-md border border-transparent bg-blue-800 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {t('close')}
          </button>
        </footer>
      </div>
    </div>
  );
};

export default CraViewModal;

