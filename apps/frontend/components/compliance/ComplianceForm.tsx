import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'next-i18next';
import { useSession } from 'next-auth/react';
import { ComplianceArea, ComplianceState, RequirementAssessment } from '@/types/compliance';
import { OscratOrganizationRole } from '@oscrat/model';
import { AreaList, RequirementQuestionnaire } from '@/components/compliance';
import toast from 'react-hot-toast';
import { getComplianceNamespace } from '@/lib/compliance/translations';
import { useOrgCompliance } from '@/hooks/oscrat/useOrgCompliance';
import { useVersionCompliance } from '@/hooks/oscrat/useVersionCompliance';

interface ComplianceFormProps {
  complianceData: ComplianceArea[];
  productId?: string;
  versionId?: string;
  teamSlug: string;
  teamId: string;
  teamRole: OscratOrganizationRole;
  teamName: string;
  productName: string;
  storageKeyPrefix?: string;
}

const createInitialState = (
  productId: string | undefined,
  teamRole: OscratOrganizationRole
): ComplianceState => ({
  productId: productId || '',
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
  versionId,
  teamSlug,
  teamId,
  teamRole,
  teamName,
  productName,
  storageKeyPrefix = 'compliance',
}) => {
  const complianceType = storageKeyPrefix === 'team_compliance' ? 'team' : 'version';
  const complianceNamespace = getComplianceNamespace(teamRole, complianceType);
  
  const { t, ready } = useTranslation(['common', complianceNamespace]);
  const { data: session } = useSession();
  
  // Validate: both productId and versionId must be valid or both null/undefined
  const isVersionCompliance = !!(productId && versionId);
  const isOrgCompliance = !productId && !versionId;
  
  if (!isVersionCompliance && !isOrgCompliance) {
    throw new Error('Invalid compliance configuration: both productId and versionId must be provided, or both must be null');
  }

  const orgComplianceHook = useOrgCompliance({
    teamSlug,
    teamId,
    teamRole,
    userId: session?.user?.id,
  });

  const versionComplianceHook = useVersionCompliance({
    teamSlug,
    productId: productId!,
    versionId: versionId!,
    teamRole,
    userId: session?.user?.id,
  });

  const {
    complianceState: hookComplianceState,
    saveToLocalStorage,
    saveToDatabase,
    resetAssessment,
  } = isVersionCompliance ? versionComplianceHook : orgComplianceHook;

  const [localState, setLocalState] = useState<ComplianceState>(() => 
    createInitialState(productId, teamRole)
  );
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);

  useEffect(() => {
    if (hookComplianceState) {
      setLocalState(hookComplianceState);
    }
  }, [hookComplianceState]);

  useEffect(() => {
    if (!localState.completed) {
      saveToLocalStorage(localState);
    }
  }, [localState, saveToLocalStorage]);

  const handleAreaSelect = useCallback((areaIndex: number) => {
    setLocalState(prev => {
      const area = complianceData[areaIndex];
      
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

  const handleRequirementComplete = useCallback(async (assessment: RequirementAssessment) => {
    if (localState.currentAreaIndex === null || localState.currentRequirementIndex === null) {
      return;
    }

    let allAreasComplete = false;
    let updatedState: ComplianceState = localState;
    
    setLocalState(prev => {
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

      const nextRequirementIndex = prev.currentRequirementIndex + 1;

      updatedState = {
        ...prev,
        assessments: newAssessments,
        completedRequirements,
        completedAreas,
        currentRequirementIndex: nextRequirementIndex,
        lastUpdatedAt: new Date().toISOString(),
        completed: allAreasComplete,
        started: true,
      };
      
      return updatedState;
    });

    const currentArea = complianceData[localState.currentAreaIndex];
    const nextRequirementIndex = localState.currentRequirementIndex + 1;
    
    if (nextRequirementIndex >= currentArea.content.length) {
      toast.success(t('oscrat.ui.area-completed', { 
        area: currentArea.areaOfRequirements 
      }));
      
      if (allAreasComplete) {
        try {
          await saveToDatabase(updatedState);
          toast.success(t('oscrat.ui.assessment-saved-successfully'));
        } catch {
          toast.error(t('oscrat.ui.failed-to-save-assessment'));
        }
      }
      
      setShowQuestionnaire(false);
    }
  }, [
    complianceData,
    localState.currentAreaIndex,
    localState.currentRequirementIndex,
    t,
    saveToDatabase,
  ]);

  const handleBack = useCallback(() => {
    if (localState.currentRequirementIndex !== null && localState.currentRequirementIndex > 0) {
      setLocalState(prev => ({
        ...prev,
        currentRequirementIndex: prev.currentRequirementIndex! - 1,
        lastUpdatedAt: new Date().toISOString(),
      }));
    } else {
      setShowQuestionnaire(false);
    }
  }, [localState.currentRequirementIndex]);

  const getAreaProgress = useCallback((areaId: number): number => {
    const area = complianceData.find(a => a.id === areaId);
    if (!area) return 0;

    const totalRequirements = area.content.length;
    const completedCount = area.content.filter(r => 
      localState.completedRequirements.find(cr => cr.id === r.reqId)
    ).length;

    return totalRequirements > 0 ? (completedCount / totalRequirements) * 100 : 0;
  }, [complianceData, localState.completedRequirements]);

  const getRequirementAssessment = useCallback((requirementId: string): RequirementAssessment | undefined => {
    return localState.assessments.find(a => a.requirementId === requirementId);
  }, [localState.assessments]);

  const handleReset = useCallback(async () => {
    try {
      await resetAssessment();
      setLocalState(createInitialState(productId, teamRole));
      toast.success(t('oscrat.ui.assessment-deleted-successfully'));
    } catch {
      toast.error(t('oscrat.ui.failed-to-delete-assessment'));
    }
  }, [resetAssessment, productId, teamRole, t]);

  if (showQuestionnaire && localState.currentAreaIndex !== null && localState.currentRequirementIndex !== null) {
    const currentArea = complianceData[localState.currentAreaIndex];
    const currentRequirement = currentArea.content[localState.currentRequirementIndex];

    if (!currentRequirement) {
      setShowQuestionnaire(false);
      return null;
    }

    if (!ready) return null;

    return (
      <RequirementQuestionnaire
        area={currentArea}
        requirement={currentRequirement}
        requirementIndex={localState.currentRequirementIndex}
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
      completedAreas={localState.completedAreas}
      onAreaSelect={handleAreaSelect}
      getAreaProgress={getAreaProgress}
      complianceState={localState}
      productId={productId}
      teamName={teamName}
      productName={productName}
      onReset={handleReset}
      complianceNamespace={complianceNamespace}
    />
  );
};

export default ComplianceForm;
