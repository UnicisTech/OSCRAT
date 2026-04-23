import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import { useSession } from 'next-auth/react';
import { useTranslation } from 'next-i18next';
import { useOscratProject } from '@/hooks/oscrat/useOscratProject';
import { useAssessments } from '@/hooks/oscrat/useOscratAssessment';
import { useFindAssessments, useGetAssessmentDetail } from '@/lib/api/hooks/oscrat/assessments';
import { OscratAssessmentType, OscratAssessmentCreateRequest } from '@oscrat/model';
import { FormState, RiskLevel } from '@/types/craForm';
import { getProductCategoryFromRisk, transformFormStateToAssessmentData, clearFormState } from '@/utils/craForm';
import { extractErrorMessage } from '@/lib/utils';
import { CRAAssessmentRawData } from '@/types/assessmentRawData';

interface UseFormOptions {
  teamSlug: string | undefined;
  productId: string | undefined;
}

export function useForm({ teamSlug, productId }: UseFormOptions) {
  const router = useRouter();
  const { data: session } = useSession();
  const { t } = useTranslation('common');
  const isEditMode = !!productId;

  const [initialFormState, setInitialFormState] = useState<Partial<FormState> | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch product
  const { project, updateProject } = useOscratProject(teamSlug || '', productId || '', { enabled: isEditMode && !!teamSlug });

  // Fetch assessments
  const { data: assessmentsResponse } = useFindAssessments(
    teamSlug || '',
    { productId },
    { enabled: isEditMode && !!teamSlug }
  );

  // Find latest CRA assessment
  const latestCRAAssessment = useMemo(() => {
    if (!isEditMode || !assessmentsResponse?.length) return null;
    const craAssessments = assessmentsResponse.filter((a) => a.type === OscratAssessmentType.CRA);
    return craAssessments.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )[0] || null;
  }, [assessmentsResponse, isEditMode]);

  // Fetch assessment detail
  const { data: assessmentDetail } = useGetAssessmentDetail(
    teamSlug || '',
    latestCRAAssessment?.id || '',
    { enabled: isEditMode && !!latestCRAAssessment && !!teamSlug }
  );

  // Setup assessment creation
  const { createAssessment } = useAssessments(
    teamSlug || '',
    { productId },
  );

  // Load existing answers into initial form state
  useEffect(() => {
    if (isEditMode && assessmentDetail?.rawData) {
      const rawData = assessmentDetail.rawData as CRAAssessmentRawData;
      const qr = rawData?.questionnaire_results;
      if (qr?.answers) {
        setInitialFormState({
          answers: qr.answers,
          activeStep: 1, // Always start from question 1
          skippedQuestions: qr.skippedQuestions || [],
          highestRiskLevel: qr.highestRiskLevel || null,
          completedAt: qr.completedAt,
        });
      }
    }
  }, [isEditMode, assessmentDetail]);

  // Handle not applicable case
  const handleNotApplicable = useCallback(async () => {
    if (!isEditMode || !productId) return;
    
    setIsProcessing(true);
    toast.error(t('oscrat.ui.product-not-applicable-cannot-update'));
    await router.replace(`/organization/${teamSlug}/products/${productId}`);
  }, [isEditMode, productId, router, teamSlug, t]);

  // Handle assessment update
  const handleAssessmentUpdate = useCallback(async (formState: FormState) => {
    if (!isEditMode || !project || !session?.user?.id) {
      return;
    }

    if (isProcessing) return; // Prevent double execution
    
    setIsProcessing(true);

    try {
      const newCategory = getProductCategoryFromRisk(formState.highestRiskLevel as RiskLevel);
      const hasCategoryChanged = project.productCategory !== newCategory;

      // Update product category if changed
      if (hasCategoryChanged) {
        await updateProject({
          name: project.name,
          acronym: project.acronym,
          description: project.description,
          type: project.type,
          productCategory: newCategory,
          status: project.status,
          updatedBy: session.user.id,
          reportingOrganizations: project.reportingOrganizations || [],
        });
        toast.success(t('oscrat.ui.product-category-updated'));
      }

      // Create new assessment
      const assessmentData: OscratAssessmentCreateRequest = {
        type: OscratAssessmentType.CRA,
        schemaVersion: '1.0.0',
        rawData: transformFormStateToAssessmentData(formState),
        productId: productId,
        createdBy: session.user.id,
      };

      await createAssessment(assessmentData);
      toast.success(t('oscrat.ui.assessment-updated-successfully'));

      clearFormState();

      await router.replace(`/organization/${teamSlug}/products/${productId}`);
    } catch (error) {
      toast.error(extractErrorMessage(error, t('oscrat.ui.failed-to-update-assessment')));
      setIsProcessing(false);
    }
  }, [
    isEditMode,
    productId,
    project,
    session?.user?.id,
    isProcessing,
    updateProject,
    createAssessment,
    router,
    teamSlug,
    t,
  ]);

  return {
    isEditMode,
    initialFormState,
    isProcessing,
    handleNotApplicable,
    handleAssessmentUpdate,
  };
}

