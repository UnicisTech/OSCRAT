import React, { useState, useMemo } from 'react';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/navigation';
import { FaRegEye, FaPencilAlt } from 'react-icons/fa';
import { OscratAssessmentType } from '@oscrat/model';
import {
  useGetProductAssessments,
  useGetProductAssessmentDetail,
} from '@/lib/api/hooks/oscrat/assessments';
import { useTeamContext } from '@/context/TeamContext';
import type { OscratProductDetail } from '@oscrat/model';
import toast from 'react-hot-toast';
import CraViewModal from './CraViewModal';

interface ApplicabilitySurveySectionProps {
  product: OscratProductDetail;
}

export default function ApplicabilitySurveySection({
  product,
}: ApplicabilitySurveySectionProps) {
  const { t, ready } = useTranslation('common');
  const router = useRouter();
  const { slug } = useTeamContext();
  const [showViewModal, setShowViewModal] = useState(false);

  const { 
    data: assessmentsResponse, 
    isLoading: isLoadingAssessments,
    error: assessmentsError 
  } = useGetProductAssessments(slug, product.id, {
    enabled: !!product.id && !!slug,
  });

  const assessments = assessmentsResponse || [];
  
  const latestCRAAssessment = useMemo(() => {
    if (assessments.length === 0) {
      return undefined;
    }
    
    const craAssessments = assessments.filter(
      (a) => a.type === OscratAssessmentType.CRA
    );
    
    if (craAssessments.length === 0) {
      return undefined;
    }
    
    return craAssessments.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )[0];
  }, [assessments]);

  const { data: assessmentDetailResponse } = useGetProductAssessmentDetail(
    slug,
    product.id,
    latestCRAAssessment?.id || '',
    { enabled: showViewModal && !!latestCRAAssessment && !!latestCRAAssessment.id }
  );

 const assessmentDetail = assessmentDetailResponse || null;

  if (!ready) return null;

  const hasAssessment = !!latestCRAAssessment;

  const handleView = () => {
    if (!hasAssessment) {
      if (isLoadingAssessments) {
        toast.error(t('oscrat.ui.loading-assessments'));
        return;
      }
      if (assessmentsError) {
        toast.error(t('oscrat.ui.failed-to-load-assessments'));
        return;
      }
      if (assessments.length === 0) {
        toast.error(t('oscrat.ui.no-assessments-found-for-product'));
        return;
      }
      toast.error(t('oscrat.ui.no-cra-assessment-found'));
      return;
    }
    setShowViewModal(true);
  };

  const handleRetake = () => {
    router.push(`/teams/${slug}/form?productId=${product.id}`);
  };

  return (
    <>
      <CraViewModal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        assessment={assessmentDetail}
      />
      <div className="my-4 flex w-full items-center justify-between rounded-md border border-gray-400 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-800">
        <h3 className="text-sm font-medium text-black dark:text-gray-100">
          {t('oscrat.ui.applicability-survey')}
        </h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleView}
            disabled={!hasAssessment || isLoadingAssessments}
            className={`flex items-center justify-center rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 ${
              hasAssessment && !isLoadingAssessments
                ? 'text-black hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700'
                : 'cursor-not-allowed text-gray-400 opacity-50'
            }`}
          >
            <FaRegEye className="mr-1.5" />
            {isLoadingAssessments ? t('oscrat.ui.loading') : t('oscrat.ui.view')}
          </button>
          <button
            onClick={handleRetake}
            className="flex items-center justify-center rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-black transition-all hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            <FaPencilAlt className="mr-1.5" />
            {hasAssessment
              ? t('oscrat.ui.edit-retake')
              : t('oscrat.ui.take-survey')}
          </button>
        </div>
      </div>
    </>
  );
}

