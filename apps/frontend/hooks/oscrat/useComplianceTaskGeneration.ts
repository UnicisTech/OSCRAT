import { useState, useCallback, useRef } from 'react';
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
  productName: string;
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
  productName,
}: UseComplianceTaskGenerationOptions) {
  const { createTask } = useTasks(teamSlug);
  const { t } = useTranslation(['common', complianceNamespace]);
  const [pendingTask, setPendingTask] = useState<PendingTask | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Use ref to avoid stale closure issues when acceptTask is called from toast
  const pendingTaskRef = useRef<PendingTask | null>(null);

  const shouldGenerateTask = useCallback((status: ComplianceStatus): boolean => {
    return status === 'Not Compliant';
  }, []);

  const generateTaskData = useCallback(
    (requirement: ComplianceRequirement): CreateTaskData => {
      const translatedRequirement = t(requirement.requirement, { ns: complianceNamespace });
      // Include the product/version context (productName already encodes
      // "Project (version)" for version assessments) so auto-generated
      // remediation tasks stay distinguishable across products and versions.
      const title = t('oscrat.ui.compliance-task-title', {
        reqId: requirement.reqId,
        requirement: translatedRequirement,
        product: productName,
      });
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
    [productId, versionId, t, complianceNamespace, productName]
  );

  const proposeTask = useCallback(
    (requirement: ComplianceRequirement, assessment: RequirementAssessment) => {

      if (!shouldGenerateTask(assessment.complianceStatus!)) {
        return false;
      }

      const taskData = generateTaskData(requirement);

      const newPendingTask = { data: taskData, requirement, assessment };
      pendingTaskRef.current = newPendingTask;
      setPendingTask(newPendingTask);
      return true;
    },
    [shouldGenerateTask, generateTaskData]
  );

  const acceptTask = useCallback(async () => {
    // Use ref to get latest value, avoiding stale closure in toast callbacks
    const task = pendingTaskRef.current;
    if (!task) {
      throw new Error('Cannot accept task: no pending task');
    }

    setIsGenerating(true);
    try {
      await createTask(task.data);
      pendingTaskRef.current = null;
      setPendingTask(null);
    } finally {
      setIsGenerating(false);
    }
  }, [createTask]);

  const rejectTask = useCallback(() => {
    pendingTaskRef.current = null;
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

