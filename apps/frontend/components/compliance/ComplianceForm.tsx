import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'next-i18next';
import { ComplianceArea, ComplianceState, RequirementAssessment } from '@/types/compliance';
import { OscratOrganizationRole } from '@oscrat/model';
import { AreaList, RequirementQuestionnaire } from '@/components/compliance';
import toast from 'react-hot-toast';

interface ComplianceFormProps {
  complianceData: ComplianceArea[];
  productId: string;
  teamRole: OscratOrganizationRole;
  teamName: string;
  productName: string;
}

const ComplianceForm: React.FC<ComplianceFormProps> = ({
  complianceData,
  productId,
  teamRole,
  teamName,
  productName, 
}) => {
  const { t, ready } = useTranslation('common');
  const [state, setState] = useState<ComplianceState>(() => {
    // Load from localStorage or create new state
    const storageKey = `compliance_${productId}`;
    const saved = localStorage.getItem(storageKey);
    
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // Error parsing saved state, will create new state
      }
    }

    return {
      productId,
      teamRole,
      assessments: [],
      currentAreaIndex: -1,
      currentRequirementIndex: -1,
      completedAreas: [],
      completedRequirements: [],
      startedAt: new Date().toISOString(),
      lastUpdatedAt: new Date().toISOString(),
    };
  });

  const [showQuestionnaire, setShowQuestionnaire] = useState(false);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    const storageKey = `compliance_${productId}`;
    localStorage.setItem(storageKey, JSON.stringify(state));
  }, [state, productId]);

  const handleAreaSelect = useCallback((areaIndex: number) => {
    setState(prev => ({
      ...prev,
      currentAreaIndex: areaIndex,
      currentRequirementIndex: 0,
      lastUpdatedAt: new Date().toISOString(),
    }));
    setShowQuestionnaire(true);
  }, []);

  const handleRequirementComplete = useCallback((assessment: RequirementAssessment) => {
    setState(prev => {
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

      // Move to next requirement or complete area
      const nextRequirementIndex = prev.currentRequirementIndex + 1;

      return {
        ...prev,
        assessments: newAssessments,
        completedRequirements,
        completedAreas,
        currentRequirementIndex: nextRequirementIndex,
        lastUpdatedAt: new Date().toISOString(),
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
      
      // Check if all areas are completed
      if (state.completedAreas.length + 1 === complianceData.length) {
        toast.success(t('oscrat.ui.compliance-assessment-complete'));
        // TODO: Save to productCompliance in DB, once specs logic is more clear
        alert('Done! All compliance areas have been assessed.');
      }
      
      // Return to area list
      setShowQuestionnaire(false);
    }
    // If there are more requirements in the current area, the component will automatically
    // show the next one because currentRequirementIndex was updated
  }, [complianceData, state.completedAreas.length, state.currentAreaIndex, state.currentRequirementIndex, t]);

  const handleBack = useCallback(() => {
    if (state.currentRequirementIndex > 0) {
      setState(prev => ({
        ...prev,
        currentRequirementIndex: prev.currentRequirementIndex - 1,
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

  if (showQuestionnaire && state.currentAreaIndex >= 0) {
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
    />
  );
};

export default ComplianceForm;
