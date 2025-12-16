import { useState } from 'react';
import { useTranslation } from 'next-i18next';
import { IoClose, IoArrowBack, IoArrowForward, IoLink } from 'react-icons/io5';
import SimpleDocTemplate from './SimpleDocTemplate';
import FullDocTemplate from './FullDocTemplate';
import RadioOption from './RadioOption';
import { AssessmentType, DeclarationType } from '@/lib/doc/types';
import type { FullDocData, SimpleDocData, DocPrefillData } from '@/lib/doc/types';
import { generateDocPDF, buildPDFDocTranslations } from '@/lib/doc/pdfGenerator';
import { DOC_GUIDE_URL, ASSESSMENT_OPTIONS, DECLARATION_OPTIONS } from '@/lib/doc/constants';
import toast from 'react-hot-toast';
import { extractErrorMessage } from '@/lib/utils';

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
  const [step, setStep] = useState(1);
  const [assessmentType, setAssessmentType] = useState<AssessmentType>(AssessmentType.SELF);
  const [declarationType, setDeclarationType] = useState<DeclarationType>(DeclarationType.SIMPLE);
  const [isGenerating, setIsGenerating] = useState(false);

  const [fullDocData, setFullDocData] = useState<FullDocData>({
    productName: prefillData.productName,
    versionName: prefillData.versionName,
    manufacturerName: prefillData.manufacturerName,
    manufacturerAddress: prefillData.manufacturerAddress,
    referenceNumber: '',
    modelNumber: '',
    uniqueIdentification: '',
    authorisedRepName: '',
    authorisedRepAddress: '',
    productDescription: '',
    harmonisationLegislation: '',
    standardsAndSpecs: '',
    notifiedBodyInfo: '',
    additionalInfo: '',
    placeAndDate: '',
    signatoryName: '',
    signatoryFunction: '',
  });

  if (!isOpen) return null;

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleGenerate = async () => {

    setIsGenerating(true);
    try {
      const simpleData: SimpleDocData = {
        manufacturerName: prefillData.manufacturerName,
        productName: prefillData.productName,
        versionName: prefillData.versionName,
      };

      const pdfBlob = await generateDocPDF({
        declarationType,
        simpleData,
        fullData: fullDocData,
        translations: buildPDFDocTranslations(t),
      });

      const filename = `DoC_${prefillData.productName}_${prefillData.versionName}.pdf`;
      await onGenerate(pdfBlob, filename);
      onClose();
    } catch (error) {
      toast.error(extractErrorMessage(error, t('oscrat.ui.doc.doc-generation-failed')));
    } finally {
      setIsGenerating(false);
    }
  };

  const simpleDocData: SimpleDocData = {
    manufacturerName: prefillData.manufacturerName,
    productName: prefillData.productName,
    versionName: prefillData.versionName,
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-lg bg-white shadow-xl dark:bg-gray-800">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-700">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t('oscrat.ui.doc.create-doc')}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t('oscrat.ui.doc.step-progress', { current: step, total: 4 })}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500 dark:hover:bg-gray-700"
          >
            <IoClose className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {step === 1 && (
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

          {step === 2 && (
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
                    selected={assessmentType}
                    onChange={setAssessmentType}
                  />
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
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
                    selected={declarationType}
                    onChange={setDeclarationType}
                  />
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {t('oscrat.ui.doc.step4-title')}
              </h3>
              {declarationType === DeclarationType.SIMPLE ? (
                <SimpleDocTemplate data={simpleDocData} />
              ) : (
                <FullDocTemplate data={fullDocData} onChange={setFullDocData} />
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-gray-200 p-4 dark:border-gray-700">
          <button
            onClick={handleBack}
            disabled={step === 1}
            className="flex items-center gap-1 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            <IoArrowBack className="h-4 w-4" />
            {t('back')}
          </button>

          {step < 4 ? (
            <button
              onClick={handleNext}
              className="flex items-center gap-1 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              {t('next')}
              <IoArrowForward className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
            >
              {isGenerating ? t('oscrat.ui.doc.generating') : t('oscrat.ui.doc.generate-pdf')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
