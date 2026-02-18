import { useTranslation } from 'next-i18next';
import { IoClose, IoArrowBack, IoArrowForward, IoLink } from 'react-icons/io5';
import SimpleDocTemplate from './SimpleDocTemplate';
import FullDocTemplate from './FullDocTemplate';
import RadioOption from './RadioOption';
import { DeclarationType } from '@/lib/doc/types';
import type { DocPrefillData } from '@/lib/doc/types';
import { DOC_GUIDE_URL, ASSESSMENT_OPTIONS, DECLARATION_OPTIONS } from '@/lib/doc/constants';
import { useDocWizard } from './hooks/useDocWizard';

interface DocWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (pdfBlob: Blob, filename: string) => Promise<void>;
  prefillData: DocPrefillData;
}

export default function DocWizard({
  isOpen,
  onClose,
  onGenerate,
  prefillData,
}: DocWizardProps) {
  const { t } = useTranslation('common');

  const wizard = useDocWizard({ prefillData, onGenerate, onClose });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-lg bg-white shadow-xl dark:bg-gray-800">
        <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-700">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t('oscrat.ui.doc.create-doc')}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t('oscrat.ui.doc.step-progress', { current: wizard.step, total: 4 })}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500 dark:hover:bg-gray-700"
          >
            <IoClose className="h-6 w-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {wizard.step === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {t('oscrat.ui.doc.step1-title')}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('oscrat.ui.doc.step1-description')}
              </p>
              <a
                href={DOC_GUIDE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                <IoLink className="h-5 w-5" />
                {t('oscrat.ui.doc.open-guide')}
              </a>
            </div>
          )}

          {wizard.step === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {t('oscrat.ui.doc.step2-title')}
              </h3>
              <div className="space-y-3">
                {ASSESSMENT_OPTIONS.map((option) => (
                  <RadioOption
                    key={option.value}
                    name="assessmentType"
                    value={option.value}
                    labelKey={option.labelKey}
                    selected={wizard.assessmentType}
                    onChange={wizard.setAssessmentType}
                  />
                ))}
              </div>
            </div>
          )}

          {wizard.step === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {t('oscrat.ui.doc.step3-title')}
              </h3>
              <div className="space-y-3">
                {DECLARATION_OPTIONS.map((option) => (
                  <RadioOption
                    key={option.value}
                    name="declarationType"
                    value={option.value}
                    labelKey={option.labelKey}
                    descKey={option.descKey}
                    selected={wizard.declarationType}
                    onChange={wizard.setDeclarationType}
                  />
                ))}
              </div>
            </div>
          )}

          {wizard.step === 4 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {t('oscrat.ui.doc.step4-title')}
              </h3>
              {wizard.declarationType === DeclarationType.SIMPLE ? (
                <SimpleDocTemplate data={wizard.simpleDocData} />
              ) : (
                <FullDocTemplate data={wizard.fullDocData} onChange={wizard.setFullDocData} />
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-gray-200 p-4 dark:border-gray-700">
          <button
            onClick={wizard.handleBack}
            disabled={wizard.step === 1}
            className="flex items-center gap-1 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            <IoArrowBack className="h-4 w-4" />
            {t('back')}
          </button>

          {wizard.step < 4 ? (
            <button
              onClick={wizard.handleNext}
              className="flex items-center gap-1 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              {t('next')}
              <IoArrowForward className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={wizard.handleGenerate}
              disabled={wizard.isGenerating}
              className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
            >
              {wizard.isGenerating ? t('oscrat.ui.doc.generating') : t('oscrat.ui.doc.generate-pdf')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
