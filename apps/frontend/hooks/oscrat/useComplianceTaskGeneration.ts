import { useState, useCallback } from 'react';
import { useTranslation } from 'next-i18next';
import { TaskStatus, TaskOriginType } from '@oscrat/model';
import { ComplianceRequirement, RequirementAssessment, ComplianceStatus } from '@/types/compliance';
import { CreateTaskData } from '@/lib/api/endpoints/tasks';
import useTasks from '@/hooks/useTasks';

interface UseComplianceTaskGenerationOptions {
  teamSlug: string;
  productId?: string;
  versionId?: string;
  userId: string;
  complianceNamespace: string;
}

interface PendingTask {
  data: CreateTaskData;
  requirement: ComplianceRequirement;
  assessment: RequirementAssessment;
}

export function useComplianceTaskGeneration({
  teamSlug,
  productId,
  versionId,
  complianceNamespace,
}: UseComplianceTaskGenerationOptions) {
  const { createTask } = useTasks(teamSlug);
  const { t } = useTranslation(['common', complianceNamespace]);
  const [pendingTask, setPendingTask] = useState<PendingTask | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const shouldGenerateTask = useCallback((status: ComplianceStatus): boolean => {
    return status === 'Not Compliant';
  }, []);

  const generateTaskData = useCallback(
    (requirement: ComplianceRequirement): CreateTaskData => {
      const translatedRequirement = t(requirement.requirement, { ns: complianceNamespace });
      const title = `[${requirement.reqId}] ${translatedRequirement}`;
      const description = requirement.genericTask || t('oscrat.ui.remediate-compliance-requirement');

      const taskData: CreateTaskData = {
        title,
        description,
        status: TaskStatus.TODO,
        originType: TaskOriginType.AUTOMATIC,
        productId,
        versionId,
      };

      return taskData;
    },
    [productId, versionId, t, complianceNamespace]
  );

  const proposeTask = useCallback(
    (requirement: ComplianceRequirement, assessment: RequirementAssessment) => {

      if (!shouldGenerateTask(assessment.complianceStatus!)) {
        return false;
      }

      const taskData = generateTaskData(requirement);

      const newPendingTask = { data: taskData, requirement, assessment };
      setPendingTask(newPendingTask);
      return true;
    },
    [shouldGenerateTask, generateTaskData]
  );

  const acceptTask = useCallback(async () => {
    if (!pendingTask) {
      throw new Error('Cannot accept task: no pending task');
    }

    setIsGenerating(true);
    try {
      await createTask(pendingTask.data);
      setPendingTask(null);
    } finally {
      setIsGenerating(false);
    }
  }, [createTask, pendingTask]);

  const rejectTask = useCallback(() => {
    setPendingTask(null);
  }, []);

  return {
    pendingTask,
    isGenerating,
    proposeTask,
    acceptTask,
    rejectTask,
    shouldGenerateTask,
  };
}

