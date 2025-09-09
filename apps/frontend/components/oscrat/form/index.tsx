import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CraForm from '@/components/craForm';
import Result from '@/components/craForm/result';
import { FormPageState } from '@/types/craForm';
import { clearFormState } from '@/utils/craForm';

const FormPage: React.FC = () => {
  const router = useRouter();

  const [state, setState] = useState<FormPageState>({
    showResult: false,
    isNotEligible: false,
    highestRisk: null,
  });

  // Clear localStorage when user leaves without completing
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (!state.showResult) {
        clearFormState();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [state.showResult]);

  const handleTryAgain = () => {
    clearFormState();
    
    setState({
      showResult: false,
      isNotEligible: false,
      highestRisk: null,
    });
    
    router.push('/form');
  };

  const setIsNotEligible = (value: boolean) => {
    setState(prev => ({ ...prev, isNotEligible: value }));
  };

  const setShowResult = (value: boolean) => {
    setState(prev => ({ ...prev, showResult: value }));
  };

  const setHighestRisk = (value: string | null) => {
    setState(prev => ({ ...prev, highestRisk: value }));
  };

  if (state.showResult) {
    return (
      <Result
        isEligible={!state.isNotEligible}
        onTryAgain={handleTryAgain}
        highestRiskLevel={state.highestRisk}
      />
    );
  }

  return (
    <CraForm
      setIsNotEligible={setIsNotEligible}
      setShowResult={setShowResult}
      setHighestRisk={setHighestRisk}
    />
  );
};

export default FormPage;