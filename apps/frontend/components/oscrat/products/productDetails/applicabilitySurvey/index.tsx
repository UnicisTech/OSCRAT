import React, { useState, useMemo } from 'react';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/navigation';
import { FaRegEye, FaPencilAlt } from 'react-icons/fa';
import { OscratAssessmentType } from '@oscrat/model';
import {
  useFindAssessments,
  useGetAssessmentDetail,
} from '@/lib/api/hooks/oscrat/assessments';
import { useTeamContext } from '@/context/TeamContext';
import type { OscratProductDetail } from '@oscrat/model';
import toast from 'react-hot-toast';
import Button from '@/components/button';
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
    error: assessmentsError,
  } = useFindAssessments(
    slug,
    { productId: product.id },
    {
      enabled: !!product.id && !!slug,
    }
  );

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
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )[0];
  }, [assessments]);

  const { data: assessmentDetailResponse } = useGetAssessmentDetail(
    slug,
    latestCRAAssessment?.id || '',
    {
      enabled:
        showViewModal && !!latestCRAAssessment && !!latestCRAAssessment.id,
    }
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
    router.push(`/organization/${slug}/form?productId=${product.id}`);
  };

  return (
    <>
      <CraViewModal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        assessment={assessmentDetail}
      />
      <div className="border-line bg-surface rounded-card my-4 flex w-full items-center justify-between border px-4 py-3">
        <h3 className="text-sm font-medium text-black">
          {t('oscrat.ui.applicability-survey')}
        </h3>
        <div className="flex items-center space-x-2">
          <Button
            variant="secondary"
            size="m"
            onClick={handleView}
            disabled={!hasAssessment || isLoadingAssessments}
            startIcon={<FaRegEye />}
          >
            {isLoadingAssessments
              ? t('oscrat.ui.loading')
              : t('oscrat.ui.view')}
          </Button>
          <Button
            variant="secondary"
            size="m"
            onClick={handleRetake}
            startIcon={<FaPencilAlt />}
          >
            {hasAssessment
              ? t('oscrat.ui.edit-retake')
              : t('oscrat.ui.take-survey')}
          </Button>
        </div>
      </div>
    </>
  );
}
