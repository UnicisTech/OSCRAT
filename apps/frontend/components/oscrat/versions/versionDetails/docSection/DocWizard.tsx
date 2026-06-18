import { useTranslation } from 'next-i18next';
import { IoClose, IoArrowBack, IoArrowForward, IoLink } from 'react-icons/io5';
import SimpleDocTemplate from './SimpleDocTemplate';
import FullDocTemplate from './FullDocTemplate';
import RadioOption from './RadioOption';
import { DeclarationType } from '@/lib/doc/types';
import type { DocPrefillData } from '@/lib/doc/types';
import {
  DOC_GUIDE_URL,
  ASSESSMENT_OPTIONS,
  DECLARATION_OPTIONS,
} from '@/lib/doc/constants';
import { useDocWizard } from './hooks/useDocWizard';
import Button from '@/components/button';

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
      <div className="bg-surface shadow-16 rounded-card flex max-h-[90vh] w-full max-w-2xl flex-col">
        <div className="border-line-subtle flex items-center justify-between border-b p-4">
          <div>
            <h2 className="text-content text-lg font-semibold">
              {t('oscrat.ui.doc.create-doc')}
            </h2>
            <p className="text-content-muted text-sm">
              {t('oscrat.ui.doc.step-progress', {
                current: wizard.step,
                total: 4,
              })}
            </p>
          </div>
          <Button
            variant="tertiary"
            onClick={onClose}
            icon={<IoClose className="h-6 w-6" />}
          />
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {wizard.step === 1 && (
            <div className="space-y-4">
              <h3 className="text-content text-lg font-medium">
                {t('oscrat.ui.doc.step1-title')}
              </h3>
              <p className="text-content-secondary text-sm">
                {t('oscrat.ui.doc.step1-description')}
              </p>
              <a
                href={DOC_GUIDE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-primary hover:bg-primary-dark text-content-inverse rounded-input inline-flex items-center gap-2 px-4 py-2"
              >
                <IoLink className="h-5 w-5" />
                {t('oscrat.ui.doc.open-guide')}
              </a>
            </div>
          )}

          {wizard.step === 2 && (
            <div className="space-y-4">
              <h3 className="text-content text-lg font-medium">
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
              <h3 className="text-content text-lg font-medium">
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
              <h3 className="text-content text-lg font-medium">
                {t('oscrat.ui.doc.step4-title')}
              </h3>
              {wizard.declarationType === DeclarationType.SIMPLE ? (
                <SimpleDocTemplate data={wizard.simpleDocData} />
              ) : (
                <FullDocTemplate
                  data={wizard.fullDocData}
                  onChange={wizard.setFullDocData}
                />
              )}
            </div>
          )}
        </div>

        <div className="border-line-subtle flex items-center justify-between border-t p-4">
          <Button
            variant="secondary"
            size="m"
            onClick={wizard.handleBack}
            disabled={wizard.step === 1}
            startIcon={<IoArrowBack className="h-4 w-4" />}
            text={t('back')}
          />

          {wizard.step < 4 ? (
            <Button
              variant="primary"
              size="m"
              onClick={wizard.handleNext}
              endIcon={<IoArrowForward className="h-4 w-4" />}
              text={t('next')}
            />
          ) : (
            <Button
              variant="primary"
              size="m"
              onClick={wizard.handleGenerate}
              disabled={wizard.isGenerating}
              loading={wizard.isGenerating}
              text={
                wizard.isGenerating
                  ? t('oscrat.ui.doc.generating')
                  : t('oscrat.ui.doc.generate-pdf')
              }
            />
          )}
        </div>
      </div>
    </div>
  );
}
