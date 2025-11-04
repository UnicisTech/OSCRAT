import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'next-i18next';
import { ComplianceArea, ComplianceState, RequirementAssessment } from '@/types/compliance';
import { OscratOrganizationRole } from '@oscrat/model';
import { AreaList, RequirementQuestionnaire } from '@/components/compliance';
import toast from 'react-hot-toast';
import { getComplianceNamespace } from '@/lib/compliance/translations';

interface ComplianceFormProps {
  complianceData: ComplianceArea[];
  productId: string;
  teamRole: OscratOrganizationRole;
  teamName: string;
  productName: string;
  storageKeyPrefix?: string;
}

const createInitialState = (
  productId: string,
  teamRole: OscratOrganizationRole
): ComplianceState => ({
  productId,
  teamRole,
  assessments: [],
  currentAreaIndex: null,
  currentRequirementIndex: null,
  completedAreas: [],
  completedRequirements: [],
  startedAt: new Date().toISOString(),
  lastUpdatedAt: new Date().toISOString(),
  completed: false,
  started: false,
});

const ComplianceForm: React.FC<ComplianceFormProps> = ({
  complianceData,
  productId,
  teamRole,
  teamName,
  productName,
  storageKeyPrefix = 'compliance',
}) => {
  // Determine compliance namespace based on storage key prefix
  const complianceType = storageKeyPrefix === 'team_compliance' ? 'team' : 'version';
  const complianceNamespace = getComplianceNamespace(teamRole, complianceType);
  
  const { t, ready } = useTranslation(['common', complianceNamespace]);
  const storageKey = `${storageKeyPrefix}_${productId}`;
  
  const [state, setState] = useState<ComplianceState>(() => {
    // Load from localStorage or create new state
    const saved = localStorage.getItem(storageKey);
    
    if (saved) {
      try {
        const savedState = JSON.parse(saved) as ComplianceState;
        // Continue with saved state regardless of completion status
        // User can explicitly reset if they want to start over
        return savedState;
      } catch {
        // Error parsing saved state, will create new state
      }
    }

    return createInitialState(productId, teamRole);
  });

  const [showQuestionnaire, setShowQuestionnaire] = useState(false);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(state));
  }, [state, storageKey]);

  const handleAreaSelect = useCallback((areaIndex: number) => {
    setState(prev => {
      const area = complianceData[areaIndex];
      
      // Find the first incomplete requirement in this area
      let firstIncompleteIndex = 0;
      for (let i = 0; i < area.content.length; i++) {
        const req = area.content[i];
        const isCompleted = prev.completedRequirements.some(cr => cr.id === req.reqId);
        if (!isCompleted) {
          firstIncompleteIndex = i;
          break;
        }
      }
      
      return {
        ...prev,
        currentAreaIndex: areaIndex,
        currentRequirementIndex: firstIncompleteIndex,
        lastUpdatedAt: new Date().toISOString(),
      };
    });
    setShowQuestionnaire(true);
  }, [complianceData]);

  const handleRequirementComplete = useCallback((assessment: RequirementAssessment) => {
    if (state.currentAreaIndex === null || state.currentRequirementIndex === null) {
      return;
    }

    let allAreasComplete = false;
    
    setState(prev => {
      if (prev.currentAreaIndex === null || prev.currentRequirementIndex === null) {
        return prev;
      }

      const newAssessments = [...prev.assessments];
      const existingIndex = newAssessments.findIndex(
        a => a.requirementId === assessment.requirementId
      );

      if (existingIndex >= 0) {
        newAssessments[existingIndex] = assessment;
      } else {
        newAssessments.push(assessment);
      }

      const currentArea = complianceData[prev.currentAreaIndex];
      const completedRequirements = [...prev.completedRequirements];
      
      if (!completedRequirements.find(r => r.id === assessment.requirementId)) {
        completedRequirements.push({
          id: assessment.requirementId,
          text: assessment.requirementText
        });
      }

      // Check if all requirements in current area are completed
      const areaRequirementIds = currentArea.content.map(r => r.reqId);
      const areaComplete = areaRequirementIds.every(id => 
        completedRequirements.find(r => r.id === id)
      );

      const completedAreas = [...prev.completedAreas];
      if (areaComplete && !completedAreas.find(a => a.id === currentArea.id)) {
        completedAreas.push({
          id: currentArea.id,
          text: currentArea.areaOfRequirements
        });
      }

      allAreasComplete = completedAreas.length === complianceData.length;

      // Move to next requirement or complete area
      const nextRequirementIndex = prev.currentRequirementIndex + 1;

      return {
        ...prev,
        assessments: newAssessments,
        completedRequirements,
        completedAreas,
        currentRequirementIndex: nextRequirementIndex,
        lastUpdatedAt: new Date().toISOString(),
        completed: allAreasComplete,
        started: true,
      };
    });

    // Handle navigation after state update
    const currentArea = complianceData[state.currentAreaIndex];
    const nextRequirementIndex = state.currentRequirementIndex + 1;
    
    if (nextRequirementIndex >= currentArea.content.length) {
      // Area completed
      toast.success(t('oscrat.ui.area-completed', { 
        area: currentArea.areaOfRequirements 
      }));
      
 
      if (allAreasComplete) {
        toast.success(t('oscrat.ui.compliance-assessment-complete'));
        // TODO: Save to productCompliance in DB, once specs logic is more clear
        alert(t('done-all-compliance-areas-assessed'));
      }
      
      // Return to area list
      setShowQuestionnaire(false);
    }
    // If there are more requirements in the current area, the component will automatically
    // show the next one because currentRequirementIndex was updated
  }, [complianceData, state.currentAreaIndex, state.currentRequirementIndex, t]);

  const handleBack = useCallback(() => {
    if (state.currentRequirementIndex !== null && state.currentRequirementIndex > 0) {
      setState(prev => ({
        ...prev,
        currentRequirementIndex: prev.currentRequirementIndex! - 1,
        lastUpdatedAt: new Date().toISOString(),
      }));
    } else {
      setShowQuestionnaire(false);
    }
  }, [state.currentRequirementIndex]);

  const getAreaProgress = useCallback((areaId: number): number => {
    const area = complianceData.find(a => a.id === areaId);
    if (!area) return 0;

    const totalRequirements = area.content.length;
    const completedCount = area.content.filter(r => 
      state.completedRequirements.find(cr => cr.id === r.reqId)
    ).length;

    return totalRequirements > 0 ? (completedCount / totalRequirements) * 100 : 0;
  }, [complianceData, state.completedRequirements]);

  const getRequirementAssessment = useCallback((requirementId: string): RequirementAssessment | undefined => {
    return state.assessments.find(a => a.requirementId === requirementId);
  }, [state.assessments]);

  const handleReset = useCallback(() => {
    localStorage.removeItem(storageKey);
    setState(createInitialState(productId, teamRole));
  }, [storageKey, productId, teamRole]);

  if (showQuestionnaire && state.currentAreaIndex !== null && state.currentRequirementIndex !== null) {
    const currentArea = complianceData[state.currentAreaIndex];
    const currentRequirement = currentArea.content[state.currentRequirementIndex];

    if (!currentRequirement) {
      setShowQuestionnaire(false);
      return null;
    }

    if (!ready) return null;

    return (
      <RequirementQuestionnaire
        area={currentArea}
        requirement={currentRequirement}
        requirementIndex={state.currentRequirementIndex}
        totalRequirements={currentArea.content.length}
        existingAssessment={getRequirementAssessment(currentRequirement.reqId)}
        onComplete={handleRequirementComplete}
        onBack={handleBack}
        complianceNamespace={complianceNamespace}
      />
    );
  }

  return (
    <AreaList
      areas={complianceData}
      completedAreas={state.completedAreas}
      onAreaSelect={handleAreaSelect}
      getAreaProgress={getAreaProgress}
      complianceState={state}
      productId={productId}
      teamName={teamName}
      productName={productName}
      onReset={handleReset}
      complianceNamespace={complianceNamespace}
    />
  );
};

export default ComplianceForm;
