import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'next-i18next';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { ComplianceArea, ComplianceState, RequirementAssessment } from '@/types/compliance';
import { OscratOrganizationRole } from '@oscrat/model';
import { AreaList, RequirementQuestionnaire, exportComplianceToPDF } from '@/components/compliance';
import toast from 'react-hot-toast';
import { getComplianceNamespace, type ComplianceType } from '@/lib/compliance/translations';
import { buildPDFTranslations } from '@/lib/compliance/pdfTranslations';
import { useOrgCompliance } from '@/hooks/oscrat/useOrgCompliance';
import { useVersionCompliance } from '@/hooks/oscrat/useVersionCompliance';
import { useComplianceTaskGeneration } from '@/hooks/oscrat/useComplianceTaskGeneration';
import { useDeclarationOfConformity } from '@/hooks/oscrat/useDeclarationOfConformity';
import { COMPLIANCE_STATUS } from '@/constants/conformityStatuses';
import { generateCARFilename } from '@/lib/utils/filename';

interface ComplianceFormProps {
  complianceData: ComplianceArea[];
  productId?: string;
  versionId?: string;
  teamSlug: string;
  teamId: string;
  teamRole: OscratOrganizationRole;
  teamName: string;
  productName: string;
  complianceType: ComplianceType;
  customTranslations?: Record<string, string> | null;
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
  finished: false,
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
  complianceType,
  customTranslations = null,
}) => {
  const complianceNamespace = getComplianceNamespace(teamRole, complianceType);
  
  const { t, ready } = useTranslation(['common', complianceNamespace]);
  const { data: session } = useSession();
  const router = useRouter();
  
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

  const taskGeneration = useComplianceTaskGeneration({
    teamSlug,
    productId: isVersionCompliance ? productId : undefined,
    versionId: isVersionCompliance ? versionId : undefined,
    userId: session?.user?.id as string,
    complianceNamespace,
  });

  // For uploading CAR when assessment is finished (version compliance only)
  const { uploadCAR } = useDeclarationOfConformity(
    teamId,
    isVersionCompliance ? productId : '',
    isVersionCompliance ? versionId : ''
  );

  const {
    complianceState: hookComplianceState,
    saveToDatabase,
    resetAssessment,
  } = isVersionCompliance ? versionComplianceHook : orgComplianceHook;

  const [localState, setLocalState] = useState<ComplianceState>(() => 
    createInitialState(productId, teamRole)
  );
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);

  useEffect(() => {
    if (hookComplianceState) {
      setLocalState(prev => {
        // If we're actively in the questionnaire, preserve navigation state
        // but update the assessments and other data from the database
        if (showQuestionnaire && prev.currentAreaIndex !== null && prev.currentRequirementIndex !== null) {
          return {
            ...hookComplianceState,
            currentAreaIndex: prev.currentAreaIndex,
            currentRequirementIndex: prev.currentRequirementIndex,
          };
        }
        // Otherwise, use the state from the database as-is
        return hookComplianceState;
      });
    }
  }, [hookComplianceState, showQuestionnaire]);

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

      const totalRequirements = complianceData.reduce((total, area) => total + area.content.length, 0);
      const allRequirementsEvaluated = newAssessments.length === totalRequirements && 
        newAssessments.every(a => a.complianceStatus !== undefined);
      
      const allCompliantOrNotApplicable = allRequirementsEvaluated &&
        newAssessments.every(a => 
          a.complianceStatus === COMPLIANCE_STATUS.FULLY_COMPLIANT || 
          a.complianceStatus === COMPLIANCE_STATUS.NOT_APPLICABLE
        );

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
        finished: allCompliantOrNotApplicable,
      };
      
      return updatedState;
    });

    const currentArea = complianceData[updatedState.currentAreaIndex!];
    const currentRequirementIndexJustCompleted = updatedState.currentRequirementIndex! - 1;
    const currentRequirement = currentArea.content[currentRequirementIndexJustCompleted];
    const nextRequirementIndex = updatedState.currentRequirementIndex!;

    // Save to database after each requirement is completed
    try {
      await saveToDatabase(updatedState);
    } catch {
      toast.error(t('oscrat.ui.failed-to-save-assessment'));
    }

    // Check if task should be generated for non-compliant requirement
    if (taskGeneration.shouldGenerateTask(assessment.complianceStatus!)) {
      const taskProposed = taskGeneration.proposeTask(currentRequirement, assessment);
      if (taskProposed) {
        toast((toastInstance) => (
          <div className="flex flex-col gap-3">
            <div>
              <p className="font-semibold">{t('oscrat.ui.auto-task-generated')}</p>
              <p className="text-sm text-gray-600 mt-1">{t('oscrat.ui.auto-task-prompt')}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={async () => {
                  try {
                    await taskGeneration.acceptTask();
                    toast.success(t('oscrat.ui.task-created-successfully'));
                    toast.dismiss(toastInstance.id);
                  } catch {
                    toast.error(t('oscrat.ui.task-creation-failed'));
                    toast.dismiss(toastInstance.id);
                  }
                }}
                className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                disabled={taskGeneration.isGenerating}
              >
                {t('oscrat.ui.accept-task')}
              </button>
              <button
                onClick={() => {
                  taskGeneration.rejectTask();
                  toast.success(t('oscrat.ui.task-rejected'));
                  toast.dismiss(toastInstance.id);
                }}
                className="px-3 py-1.5 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300"
              >
                {t('oscrat.ui.reject-task')}
              </button>
            </div>
          </div>
        ), { 
          duration: Infinity,
          position: 'top-right',
        });
      }
    }
    
    if (nextRequirementIndex >= currentArea.content.length) {
      toast.success(t('oscrat.ui.area-completed', { 
        area: t(currentArea.areaOfRequirements, { ns: complianceNamespace })
      }));
      
      if (allAreasComplete) {
        if (updatedState.finished && isVersionCompliance) {
          // Generate CAR PDF and upload it, then navigate back
          toast.success(t('oscrat.ui.assessment-completed-generating-car'));
          
          const pdfTranslations = buildPDFTranslations(t);

          try {
            const pdfBlob = await exportComplianceToPDF(
              complianceData,
              updatedState,
              versionId!,
              teamName,
              productName,
              pdfTranslations,
              (key: string) => t(key, { ns: complianceNamespace }),
              true // Return blob instead of downloading
            );
            
            if (pdfBlob) {
              const filename = generateCARFilename(productName);
              const file = new File([pdfBlob], filename, { type: 'application/pdf' });
              await uploadCAR(file);
              toast.success(t('oscrat.ui.car-generated-and-set'));
              router.push(`/teams/${teamSlug}/products/${productId}/versions/${versionId}`);
            }
          } catch {
            toast.error(t('oscrat.ui.car-generation-failed'));
          }
        } else if (updatedState.finished) {
          toast.success(t('oscrat.ui.assessment-completed-finished'));
        } else {
          toast.success(t('oscrat.ui.assessment-saved-successfully'));
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
    complianceNamespace,
    isVersionCompliance,
    taskGeneration,
    uploadCAR,
    router,
    teamSlug,
    productId,
    versionId,
    teamName,
    productName,
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
        customTranslations={customTranslations}
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
      customTranslations={customTranslations}
    />
  );
};

export default ComplianceForm;
