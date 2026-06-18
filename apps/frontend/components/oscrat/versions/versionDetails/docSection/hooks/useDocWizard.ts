import { useState } from 'react';
import { useTranslation } from 'next-i18next';
import toast from 'react-hot-toast';
import { AssessmentType, DeclarationType } from '@/lib/doc/types';
import type {
  FullDocData,
  SimpleDocData,
  DocPrefillData,
} from '@/lib/doc/types';
import {
  generateDocPDF,
  buildPDFDocTranslations,
} from '@/lib/doc/pdfGenerator';
import { extractErrorMessage } from '@/lib/utils';

interface UseDocWizardConfig {
  prefillData: DocPrefillData;
  onGenerate: (pdfBlob: Blob, filename: string) => Promise<void>;
  onClose: () => void;
}

export function useDocWizard({
  prefillData,
  onGenerate,
  onClose,
}: UseDocWizardConfig) {
  const { t } = useTranslation('common');
  const [step, setStep] = useState(1);
  const [assessmentType, setAssessmentType] = useState<AssessmentType>(
    AssessmentType.SELF
  );
  const [declarationType, setDeclarationType] = useState<DeclarationType>(
    DeclarationType.SIMPLE
  );
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

  const simpleDocData: SimpleDocData = {
    manufacturerName: prefillData.manufacturerName,
    productName: prefillData.productName,
    versionName: prefillData.versionName,
  };

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const pdfBlob = await generateDocPDF({
        declarationType,
        simpleData: simpleDocData,
        fullData: fullDocData,
        translations: buildPDFDocTranslations(t),
      });

      const filename = `DoC_${prefillData.productName}_${prefillData.versionName}.pdf`;
      await onGenerate(pdfBlob, filename);
      onClose();
    } catch (error) {
      toast.error(
        extractErrorMessage(error, t('oscrat.ui.doc.doc-generation-failed'))
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    step,
    assessmentType,
    declarationType,
    isGenerating,
    fullDocData,
    simpleDocData,
    setAssessmentType,
    setDeclarationType,
    setFullDocData,
    handleNext,
    handleBack,
    handleGenerate,
  };
}
