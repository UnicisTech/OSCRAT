import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CraForm from '@/components/craForm';
import Result from '@/components/craForm/result';
import { FormPageState } from '@/types/craForm';
import { clearFormState } from '@/utils/craForm';
import { useTeamContext } from '@/context/TeamContext';

const FormPage: React.FC = () => {
  const router = useRouter();
  
  // Try to get team context if available
  let teamSlug: string | undefined;
  try {
    const teamContext = useTeamContext();
    teamSlug = teamContext?.slug;
  } catch {
    teamSlug = undefined;
  }

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
  
    const formPath = teamSlug ? `/teams/${teamSlug}/form` : '/form';
    router.push(formPath);
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
        teamSlug={teamSlug}
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