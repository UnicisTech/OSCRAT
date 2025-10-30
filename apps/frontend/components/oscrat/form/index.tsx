import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import CraForm from '@/components/craForm';
import Result from '@/components/craForm/result';
import { FormPageState, RiskLevel, FormState } from '@/types/craForm';
import { useTeamContext } from '@/context/TeamContext';
import { useOscratProject } from '@/hooks/oscrat/useOscratProject';
import { useGetProductAssessments, useGetProductAssessmentDetail } from '@/lib/api/hooks/oscrat/assessments';
import { OscratAssessmentType } from '@oscrat/model';
import { getProductCategoryFromRisk } from '@/utils/craForm';
import { useSession } from 'next-auth/react';
import { useTranslation } from 'next-i18next';
import { useAssessments } from '@/hooks/oscrat/useOscratAssessment';
import type { OscratAssessmentCreate } from '@oscrat/model';
import { transformFormStateToAssessmentData } from '@/utils/craForm';
import { extractErrorMessage } from '@/lib/utils';

interface FormPageProps {
  teamSlug?: string;
}

const FormPage: React.FC<FormPageProps> = ({ teamSlug }) => {
  const router = useRouter();
  const { slug } = useTeamContext();
  const { data: session } = useSession();
  const { t, ready } = useTranslation('common');
  const productId = router.query.productId as string | undefined;
  const isEditMode = !!productId;

  const [state, setState] = useState<FormPageState>({
    showResult: false,
    isNotEligible: false,
    highestRisk: null,
  });

  const [completedFormState, setCompletedFormState] = useState<FormState | null>(null);
  const [initialFormState, setInitialFormState] = useState<Partial<FormState> | null>(null);
  const hasUpdatedRef = useRef(false); // Track if update has been triggered to prevent multiple executions

  // Fetch product and existing assessment if in edit mode
  const { project, updateProject } = useOscratProject(slug, productId || '', { enabled: isEditMode && !!productId });
  
  const { data: assessmentsResponse } = useGetProductAssessments(slug, productId || '', {
    enabled: isEditMode && !!productId,
  });

  const assessments = assessmentsResponse || [];
  const latestCRAAssessment = useMemo(() => {
    if (!isEditMode || assessments.length === 0) return null;
    const craAssessments = assessments.filter((a: any) => a.type === OscratAssessmentType.CRA);
    return craAssessments.sort(
      (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )[0] || null;
  }, [assessments, isEditMode]);

  const { data: assessmentDetailResponse } = useGetProductAssessmentDetail(
    slug,
    productId || '',
    latestCRAAssessment?.id || '',
    { enabled: isEditMode && !!latestCRAAssessment }
  );

  const assessmentDetail = assessmentDetailResponse || null;

  // Load existing assessment answers when assessment detail is available (edit mode)
  // Always start from question 1 when editing, but keep answers pre-filled
  useEffect(() => {
    if (isEditMode && assessmentDetail?.rawData) {
      const rawData = assessmentDetail.rawData as { questionnaire_results?: any };
      const qr = rawData?.questionnaire_results;
      if (qr?.answers) {
        setInitialFormState({
          answers: qr.answers,
          activeStep: 1, // Always start from question 1 when editing
          skippedQuestions: qr.skippedQuestions || [],
          highestRiskLevel: qr.highestRiskLevel || null,
          completedAt: qr.completedAt,
        });
      }
    }
  }, [isEditMode, assessmentDetail]);

  const handleTryAgain = () => {
    setState({
      showResult: false,
      isNotEligible: false,
      highestRisk: null,
    });
    setCompletedFormState(null);
  
    const formPath = teamSlug ? `/teams/${teamSlug}/form${productId ? `?productId=${productId}` : ''}` : '/form';
    router.push(formPath);
  };

  const setIsNotEligible = (value: boolean) => {
    setState(prev => ({ ...prev, isNotEligible: value }));
  };

  const setShowResult = (value: boolean) => {
    setState(prev => ({ ...prev, showResult: value }));
  };

  const setHighestRisk = (value: RiskLevel | null) => {
    setState(prev => ({ ...prev, highestRisk: value }));
  };

  const handleFormCompleted = (formState: FormState) => {
    setCompletedFormState(formState);
  };
  
  // Get version for assessment creation
  const versionId = project?.versions?.[0]?.id;
  const { createAssessment } = useAssessments(
    slug,
    productId || '',
    versionId || '',
    { enabled: isEditMode && !!versionId }
  );

  // Handle assessment creation when form is completed in edit mode (applicable case)
  useEffect(() => {
    // Use a unique key based on the form state to ensure we only run once per completion
    const updateKey = completedFormState 
      ? `${productId}-${completedFormState.completedAt || Date.now()}` 
      : null;
    
    if (
      isEditMode &&
      productId &&
      completedFormState &&
      versionId &&
      project &&
      session?.user?.id &&
      !state.isNotEligible &&
      state.showResult &&
      completedFormState.highestRiskLevel &&
      completedFormState.answers &&
      !hasUpdatedRef.current &&
      updateKey
    ) {
      hasUpdatedRef.current = true; // Mark as updated to prevent re-execution
      
      const handleUpdate = async () => {
        try {
          const newCategory = getProductCategoryFromRisk(completedFormState.highestRiskLevel as RiskLevel);
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
          
          // Create new assessment with all answers
          const assessmentData: OscratAssessmentCreate = {
            type: OscratAssessmentType.CRA,
            schemaVersion: '1.0.0',
            rawData: transformFormStateToAssessmentData(completedFormState),
            productId: productId,
            createdBy: session.user.id,
          };
          
          await createAssessment(assessmentData);
          toast.success(t('oscrat.ui.assessment-updated-successfully'));
          
          router.replace(`/teams/${slug}/products/${productId}`);
        } catch (error) {
          console.error('Failed to update product/assessment:', error);
          toast.error(extractErrorMessage(error, t('oscrat.ui.failed-to-update-assessment')));
          hasUpdatedRef.current = false; // Reset flag on error so user can retry
        }
      };
      
      handleUpdate();
    }
    
    // Reset the ref when form state changes (new completion)
    if (!completedFormState) {
      hasUpdatedRef.current = false;
    }
  }, [
    isEditMode,
    productId,
    completedFormState,
    versionId,
    project?.id,
    project?.productCategory,
    session?.user?.id,
    state.isNotEligible,
    state.showResult,
    router,
    slug,
    t,
    updateProject,
    createAssessment,
  ]);

  // Handle not applicable case in edit mode - redirect immediately
  const hasRedirectedNotApplicableRef = useRef(false);
  useEffect(() => {
    if (
      isEditMode && 
      state.showResult && 
      state.isNotEligible && 
      productId && 
      !hasRedirectedNotApplicableRef.current
    ) {
      hasRedirectedNotApplicableRef.current = true;
      toast.error(t('oscrat.ui.product-not-applicable-cannot-update'));
      router.replace(`/teams/${slug}/products/${productId}`);
    }
    
    // Reset when eligibility changes back
    if (!state.isNotEligible) {
      hasRedirectedNotApplicableRef.current = false;
    }
  }, [isEditMode, state.showResult, state.isNotEligible, productId, router, slug, t]);

  if (!ready) return null;

  if (state.showResult) {
    // In edit mode, don't show result modal - redirect logic is handled in useEffect
    if (isEditMode) {
      // Show loading state while redirecting
      return (
        <div className="flex flex-col items-center justify-center p-4">
          <div className="w-full max-w-2xl rounded-lg bg-white p-8 text-center shadow-xl dark:bg-gray-800">
            <div className="mb-6">
              <div className="mx-auto h-16 w-16 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
            </div>
            <h1 className="mb-4 text-2xl font-semibold text-gray-800 dark:text-gray-100">
              {state.isNotEligible 
                ? t('oscrat.ui.processing-not-applicable-result')
                : t('oscrat.ui.processing-assessment-update')}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {state.isNotEligible
                ? t('oscrat.ui.redirecting-to-product-page')
                : t('oscrat.ui.updating-product-category')}
            </p>
          </div>
        </div>
      );
    }
    
    // Not in edit mode - show normal result modal
    return (
      <Result
        isEligible={!state.isNotEligible}
        onTryAgain={handleTryAgain}
        highestRiskLevel={state.highestRisk}
        teamSlug={teamSlug}
        completedFormState={completedFormState}
        productId={productId}
      />
    );
  }

  return (
    <CraForm
      setIsNotEligible={setIsNotEligible}
      setShowResult={setShowResult}
      setHighestRisk={setHighestRisk}
      onFormCompleted={handleFormCompleted}
      initialFormState={initialFormState}
    />
  );
};

export default FormPage;