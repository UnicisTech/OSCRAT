import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'next-i18next';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { ComplianceArea, ComplianceState, RequirementAssessment } from '@/types/compliance';
import { OscratOrganizationRole } from '@oscrat/model';
import { exportComplianceToPDF } from '@/components/compliance';
import toast from 'react-hot-toast';
import { getComplianceNamespace, type ComplianceType } from '@/lib/compliance/translations';
import { buildPDFTranslations } from '@/lib/compliance/pdfTranslations';
import { useOrgCompliance } from '@/hooks/oscrat/useOrgCompliance';
import { useVersionCompliance } from '@/hooks/oscrat/useVersionCompliance';
import { useComplianceTaskGeneration } from '@/hooks/oscrat/useComplianceTaskGeneration';
import { useDeclarationOfConformity } from '@/hooks/oscrat/useDeclarationOfConformity';
import { COMPLIANCE_STATUS } from '@/constants/conformityStatuses';
import { generateCARFilename } from '@/lib/utils/filename';
import { extractErrorMessage } from '@/lib/utils';
import ComplianceFormView from './ComplianceFormView';

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

function computeCompletionFlags(
  complianceData: ComplianceArea[],
  assessments: RequirementAssessment[],
  completedAreas: Array<{ id: number; text: string }>
) {
  const requiredAreas = complianceData.filter((a) => !a.optional);
  const completed = requiredAreas.every((a) =>
    completedAreas.find((ca) => ca.id === a.id)
  );

  const questionnaireAreas = complianceData.filter((a) => a.areaType !== 'checklist');
  const questionnaireReqIds = new Set(
    questionnaireAreas.flatMap((a) => a.content.map((r) => r.reqId))
  );
  const questionnaireAssessments = assessments.filter((a) =>
    questionnaireReqIds.has(a.requirementId)
  );
  const totalRequired = questionnaireAreas.reduce(
    (n, area) => n + area.content.length, 0
  );
  const allEvaluated =
    questionnaireAssessments.length === totalRequired &&
    questionnaireAssessments.every((a) => a.complianceStatus !== undefined);
  const finished =
    allEvaluated &&
    questionnaireAssessments.every(
      (a) =>
        a.complianceStatus === COMPLIANCE_STATUS.FULLY_COMPLIANT ||
        a.complianceStatus === COMPLIANCE_STATUS.NOT_APPLICABLE
    );

  return { completed, finished };
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

  const { uploadCAR } = useDeclarationOfConformity(
    teamSlug,
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

  const generateAndUploadCAR = useCallback(
    async (state: ComplianceState) => {
      if (!state.completed || !state.finished || !isVersionCompliance) return;

      toast.success(t('oscrat.ui.assessment-completed-generating-car'));
      const pdfTranslations = buildPDFTranslations(t);

      try {
        const pdfBlob = await exportComplianceToPDF(
          complianceData,
          state,
          versionId!,
          teamName,
          productName,
          pdfTranslations,
          (key: string) => t(key, { ns: complianceNamespace }),
          true
        );

        if (pdfBlob) {
          const file = new File([pdfBlob], generateCARFilename(productName), {
            type: 'application/pdf',
          });
          await uploadCAR(file);
          toast.success(t('oscrat.ui.car-generated-and-set'));
          router.push(
            `/organization/${teamSlug}/products/${productId}/versions/${versionId}`
          );
        }
      } catch {
        toast.error(t('oscrat.ui.car-generation-failed'));
      }
    },
    [complianceData, complianceNamespace, isVersionCompliance, productId, productName, router, t, teamName, teamSlug, uploadCAR, versionId]
  );

  useEffect(() => {
    if (hookComplianceState) {
      setLocalState((prev) => {
        if (
          showQuestionnaire &&
          prev.currentAreaIndex !== null &&
          prev.currentRequirementIndex !== null
        ) {
          return {
            ...hookComplianceState,
            currentAreaIndex: prev.currentAreaIndex,
            currentRequirementIndex: prev.currentRequirementIndex,
          };
        }
        return hookComplianceState;
      });
    }
  }, [hookComplianceState, showQuestionnaire]);

  const handleAreaSelect = useCallback(
    (areaIndex: number) => {
      setLocalState((prev) => {
        const area = complianceData[areaIndex];

        let firstIncompleteIndex = 0;
        for (let i = 0; i < area.content.length; i++) {
          const req = area.content[i];
          const isCompleted = prev.completedRequirements.some(
            (cr) => cr.id === req.reqId
          );
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
    },
    [complianceData]
  );

  const handleRequirementComplete = useCallback(
    async (assessment: RequirementAssessment) => {
      if (
        localState.currentAreaIndex === null ||
        localState.currentRequirementIndex === null
      ) {
        return;
      }

      let allAreasComplete = false;
      let updatedState: ComplianceState = localState;

      setLocalState((prev) => {
        if (
          prev.currentAreaIndex === null ||
          prev.currentRequirementIndex === null
        ) {
          return prev;
        }

        const newAssessments = [...prev.assessments];
        const existingIndex = newAssessments.findIndex(
          (a) => a.requirementId === assessment.requirementId
        );

        if (existingIndex >= 0) {
          newAssessments[existingIndex] = assessment;
        } else {
          newAssessments.push(assessment);
        }

        const currentArea = complianceData[prev.currentAreaIndex];
        const completedRequirements = [...prev.completedRequirements];

        if (!completedRequirements.find((r) => r.id === assessment.requirementId)) {
          completedRequirements.push({
            id: assessment.requirementId,
            text: assessment.requirementText,
          });
        }

        const areaRequirementIds = currentArea.content.map((r) => r.reqId);
        const areaComplete = areaRequirementIds.every((id) =>
          completedRequirements.find((r) => r.id === id)
        );

        const completedAreas = [...prev.completedAreas];
        if (areaComplete && !completedAreas.find((a) => a.id === currentArea.id)) {
          completedAreas.push({
            id: currentArea.id,
            text: currentArea.areaOfRequirements,
          });
        }

        const flags = computeCompletionFlags(complianceData, newAssessments, completedAreas);
        allAreasComplete = flags.completed;

        const nextRequirementIndex = prev.currentRequirementIndex + 1;

        updatedState = {
          ...prev,
          assessments: newAssessments,
          completedRequirements,
          completedAreas,
          currentRequirementIndex: nextRequirementIndex,
          lastUpdatedAt: new Date().toISOString(),
          completed: flags.completed,
          started: true,
          finished: flags.finished,
        };

        return updatedState;
      });

      const currentArea = complianceData[updatedState.currentAreaIndex!];
      const currentRequirementIndexJustCompleted =
        updatedState.currentRequirementIndex! - 1;
      const currentRequirement =
        currentArea.content[currentRequirementIndexJustCompleted];
      const nextRequirementIndex = updatedState.currentRequirementIndex!;

      try {
        await saveToDatabase(updatedState);
      } catch {
        toast.error(t('oscrat.ui.failed-to-save-assessment'));
      }

      if (taskGeneration.shouldGenerateTask(assessment.complianceStatus!)) {
        const taskProposed = taskGeneration.proposeTask(
          currentRequirement,
          assessment
        );
        if (taskProposed) {
          toast(
            (toastInstance) => (
              <div className="flex flex-col gap-3">
                <div>
                  <p className="font-semibold">
                    {t('oscrat.ui.auto-task-generated')}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {t('oscrat.ui.auto-task-prompt')}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={async () => {
                      try {
                        await taskGeneration.acceptTask();
                        toast.success(t('oscrat.ui.task-created-successfully'));
                        toast.dismiss(toastInstance.id);
                      } catch (e) {
                        toast.error(
                          extractErrorMessage(e, 'Failed to create task')
                        );
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
            ),
            {
              duration: Infinity,
              position: 'top-right',
            }
          );
        }
      }

      if (nextRequirementIndex >= currentArea.content.length) {
        toast.success(
          t('oscrat.ui.area-completed', {
            area: t(currentArea.areaOfRequirements, {
              ns: complianceNamespace,
            }),
          })
        );

        if (allAreasComplete) {
          if (updatedState.finished && isVersionCompliance) {
            await generateAndUploadCAR(updatedState);
          } else if (updatedState.finished) {
            toast.success(t('oscrat.ui.assessment-completed-finished'));
          } else {
            toast.success(t('oscrat.ui.assessment-saved-successfully'));
          }
        }

        setShowQuestionnaire(false);
      }
    },
    [
      complianceData,
      localState.currentAreaIndex,
      localState.currentRequirementIndex,
      t,
      saveToDatabase,
      complianceNamespace,
      isVersionCompliance,
      taskGeneration,
      generateAndUploadCAR,
    ]
  );

  const handleChecklistSave = useCallback(
    async (checklistAssessments: RequirementAssessment[]) => {
      if (localState.currentAreaIndex === null) return;

      const currentArea = complianceData[localState.currentAreaIndex];
      let updatedState: ComplianceState = localState;

      setLocalState((prev) => {
        const checklistReqIds = new Set(currentArea.content.map((r) => r.reqId));
        const checkedReqIds = new Set(checklistAssessments.map((a) => a.requirementId));

        const newAssessments = prev.assessments.filter(
          (a) => !checklistReqIds.has(a.requirementId)
        );
        newAssessments.push(...checklistAssessments);

        const completedRequirements = prev.completedRequirements.filter(
          (r) => !checklistReqIds.has(r.id)
        );
        for (const assessment of checklistAssessments) {
          completedRequirements.push({
            id: assessment.requirementId,
            text: assessment.requirementText,
          });
        }

        const completedAreas = prev.completedAreas.filter(
          (a) => a.id !== currentArea.id
        );
        const allChecklistReqsDone = currentArea.content.every((r) =>
          checkedReqIds.has(r.reqId)
        );
        if (allChecklistReqsDone) {
          completedAreas.push({
            id: currentArea.id,
            text: currentArea.areaOfRequirements,
          });
        }

        const flags = computeCompletionFlags(complianceData, newAssessments, completedAreas);

        updatedState = {
          ...prev,
          assessments: newAssessments,
          completedRequirements,
          completedAreas,
          lastUpdatedAt: new Date().toISOString(),
          started: true,
          completed: flags.completed,
          finished: flags.finished,
        };

        return updatedState;
      });

      try {
        await saveToDatabase(updatedState);
        toast.success(t('oscrat.ui.checklist-saved'));
      } catch {
        toast.error(t('oscrat.ui.failed-to-save-assessment'));
      }

      await generateAndUploadCAR(updatedState);

      setShowQuestionnaire(false);
    },
    [complianceData, localState, saveToDatabase, t, generateAndUploadCAR]
  );

  const handleBack = useCallback(() => {
    if (localState.currentAreaIndex !== null) {
      const currentArea = complianceData[localState.currentAreaIndex];
      if (currentArea.areaType === 'checklist') {
        setShowQuestionnaire(false);
        return;
      }
    }

    if (
      localState.currentRequirementIndex !== null &&
      localState.currentRequirementIndex > 0
    ) {
      setLocalState((prev) => ({
        ...prev,
        currentRequirementIndex: prev.currentRequirementIndex! - 1,
        lastUpdatedAt: new Date().toISOString(),
      }));
    } else {
      setShowQuestionnaire(false);
    }
  }, [complianceData, localState.currentAreaIndex, localState.currentRequirementIndex]);

  const getAreaProgress = useCallback(
    (areaId: number): number => {
      const area = complianceData.find((a) => a.id === areaId);
      if (!area) return 0;

      const totalRequirements = area.content.length;
      const completedCount = area.content.filter((r) =>
        localState.completedRequirements.find((cr) => cr.id === r.reqId)
      ).length;

      return totalRequirements > 0
        ? (completedCount / totalRequirements) * 100
        : 0;
    },
    [complianceData, localState.completedRequirements]
  );

  const getRequirementAssessment = useCallback(
    (requirementId: string): RequirementAssessment | undefined => {
      return localState.assessments.find(
        (a) => a.requirementId === requirementId
      );
    },
    [localState.assessments]
  );

  const handleReset = useCallback(async () => {
    try {
      await resetAssessment();
      setLocalState(createInitialState(productId, teamRole));
      toast.success(t('oscrat.ui.assessment-deleted-successfully'));
    } catch {
      toast.error(t('oscrat.ui.failed-to-delete-assessment'));
    }
  }, [resetAssessment, productId, teamRole, t]);

  if (!ready) return null;

  return (
    <ComplianceFormView
      complianceData={complianceData}
      localState={localState}
      showQuestionnaire={showQuestionnaire}
      complianceNamespace={complianceNamespace}
      customTranslations={customTranslations}
      onAreaSelect={handleAreaSelect}
      onRequirementComplete={handleRequirementComplete}
      onChecklistSave={handleChecklistSave}
      onBack={handleBack}
      onReset={handleReset}
      getAreaProgress={getAreaProgress}
      getRequirementAssessment={getRequirementAssessment}
    />
  );
};

export default ComplianceForm;
