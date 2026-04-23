import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import CraForm from '@/components/craForm';
import Result from '@/components/craForm/result';
import { FormPageState, FormState } from '@/types/craForm';
import { useForm } from '@/hooks/oscrat/useForm';

interface FormPageProps {
  teamSlug?: string;
}

const FormPage: React.FC<FormPageProps> = ({ teamSlug }) => {
  const router = useRouter();
  const { t, ready } = useTranslation('common');
  const productId = router.query.productId as string | undefined;

  const [state, setState] = useState<FormPageState>({
    showResult: false,
    isNotEligible: false,
    highestRisk: null,
  });
  const [completedFormState, setCompletedFormState] = useState<FormState | null>(null);
  
  const {
    isEditMode,
    initialFormState,
    isProcessing,
    handleNotApplicable,
    handleAssessmentUpdate,
  } = useForm({ teamSlug, productId });

  const handleTryAgain = () => {
    setState({
      showResult: false,
      isNotEligible: false,
      highestRisk: null,
    });
    setCompletedFormState(null);
    const formPath = teamSlug ? `/organization/${teamSlug}/form${productId ? `?productId=${productId}` : ''}` : '/form';
    router.push(formPath);
  };

  const handleFormCompleted = (formState: FormState) => {
    setCompletedFormState(formState);
    if (isEditMode) {
      // Edit mode: onFormCompleted only called on successful completion (not eliminatory)
      handleAssessmentUpdate(formState);
    }
    // In create mode, Result component handles the flow
  };

  // Handle eliminatory case in edit mode (when result shown but no form completion)
  useEffect(() => {
    if (isEditMode && state.showResult && state.isNotEligible && !isProcessing) {
      handleNotApplicable();
    }
  }, [isEditMode, state.showResult, state.isNotEligible, isProcessing, handleNotApplicable]);

  if (!ready) return null;

  // Show loading state in edit mode while processing
  if (isEditMode && state.showResult && isProcessing) {
    return (
      <div className="flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-2xl rounded-lg bg-white p-8 text-center shadow-xl dark:bg-gray-800">
          <div className="mb-6">
            <div className="mx-auto h-16 w-16 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          </div>
          <h1 className="mb-4 text-2xl font-semibold text-gray-800 dark:text-gray-100">
            {state.isNotEligible 
              ? t('oscrat.ui.processing-not-applicable-result')
              : t('oscrat.ui.processing-assessment-update')}
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {state.isNotEligible
              ? t('oscrat.ui.redirecting-to-product-page')
              : t('oscrat.ui.updating-product-category')}
          </p>
        </div>
      </div>
    );
  }

  // Show result in create mode only
  if (!isEditMode && state.showResult) {
    return (
      <Result
        isEligible={!state.isNotEligible}
        onTryAgain={handleTryAgain}
        highestRiskLevel={state.highestRisk}
        teamSlug={teamSlug}
        completedFormState={completedFormState}
        productId={productId}
      />
    );
  }

  return (
    <CraForm
      setIsNotEligible={(value) => setState(prev => ({ ...prev, isNotEligible: value }))}
      setShowResult={(value) => setState(prev => ({ ...prev, showResult: value }))}
      setHighestRisk={(value) => setState(prev => ({ ...prev, highestRisk: value }))}
      onFormCompleted={handleFormCompleted}
      initialFormState={initialFormState}
    />
  );
};

export default FormPage;