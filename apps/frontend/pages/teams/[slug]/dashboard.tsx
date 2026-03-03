import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { GetServerSidePropsContext } from 'next';
import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import { withTeamLayout } from '@/lib/layout-helpers';
import CompletedAppCheck from '@/components/oscrat/dashboard/CompletedAppCheck';
// import TasksAndProducts from '@/components/oscrat/dashboard/TasksAndProducts';
import RecentActivities from '@/components/oscrat/dashboard/RecentActivities';
import { ComplianceCharts, exportComplianceToPDF } from '@/components/compliance';
import { useComplianceData } from '@/hooks/useComplianceData';
import { useTeamContext } from '@/context/TeamContext';
import { ComplianceState } from '@/types/compliance';
import { getComplianceNamespace } from '@/lib/compliance/translations';
import { getRoleForTeam } from '@/lib/compliance/utils';
import { FaDownload, FaPlayCircle } from 'react-icons/fa';
import { OscratAssessmentType } from '@oscrat/model';
import { loadFormState } from '@/utils/craForm';
import type { FormState } from '@/types/craForm';
import { useAssessments, useOscratAssessment } from '@/hooks/oscrat/useOscratAssessment';
import { useLatestAssessment } from '@/hooks/oscrat/useLatestAssessment';
import { transformOrgAssessmentToComplianceState } from '@/utils/compliance';

const TeamDashboard = () => {
  const { teamContext } = useTeamContext();
  const team = teamContext.team!;
  const router = useRouter();
  
  const complianceNamespace = useMemo(() => {
    return getComplianceNamespace(getRoleForTeam(team.orgRoles[0]), 'team');
  }, [team.orgRoles]);
  
  const { t, ready } = useTranslation(['common', complianceNamespace]);

  // Check localStorage for completed CRA form data (before product creation)
  const [completedCraForm, setCompletedCraForm] = useState<FormState | null>(null);

  useEffect(() => {
    const formState = loadFormState();
    if (formState && formState.completed && formState.highestRiskLevel) {
      setCompletedCraForm(formState as FormState);
    } else {
      setCompletedCraForm(null);
    }
  }, []);

  const shouldShowCompletedAppCheck = !!completedCraForm;

  const { complianceData, isLoading: isComplianceLoading } = useComplianceData({
    teamSlug: team.slug,
    teamRole: team.orgRoles[0],
    complianceType: 'team',
  });

  const { assessments, isLoading: isLoadingAssessments } = useAssessments(team.slug);

  const latestOrgAssessmentId = useLatestAssessment(assessments, OscratAssessmentType.ORG);

  // Fetch the detailed assessment with rawData
  const { assessment: assessmentDetail, isLoading: isLoadingAssessmentDetail } = useOscratAssessment(
    team.slug,
    latestOrgAssessmentId || '',
    { enabled: !!latestOrgAssessmentId }
  );

  const complianceState = useMemo<ComplianceState | null>(() => {
    if (assessmentDetail?.rawData) {
      return transformOrgAssessmentToComplianceState(
        assessmentDetail.rawData,
        team.orgRoles[0]
      );
    }
    
    const storageKey = `team_compliance_${team.id}`;
    const saved = localStorage.getItem(storageKey);
    
    if (saved) {
      try {
        return JSON.parse(saved) as ComplianceState;
      } catch {
        localStorage.removeItem(storageKey);
      }
    }
    
    // Initialize empty state for newly created teams
    return {
      productId: team.id,
      teamRole: team.orgRoles[0],
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
    };
  }, [team.id, team.orgRoles, assessmentDetail]);

  const showCharts = !isComplianceLoading && !isLoadingAssessments && !isLoadingAssessmentDetail && complianceData && complianceData.length > 0;

  const handleExportPDF = async () => {
    if (!complianceData || !complianceState || !ready) return;

    const pdfTranslations = {
      reportTitle: t('oscrat.ui.dashboard.pdf.report-title'),
      product: t('oscrat.ui.dashboard.pdf.product'),
      organization: t('oscrat.ui.dashboard.pdf.organization'),
      generated: t('oscrat.ui.dashboard.pdf.generated'),
      overallProgress: t('oscrat.ui.dashboard.overall-progress'),
      complete: t('oscrat.ui.dashboard.pdf.complete'),
      of: t('oscrat.ui.dashboard.pdf.of'),
      requirementsEvaluated: t('oscrat.ui.dashboard.requirements-evaluated'),
      summaryStatistics: t('oscrat.ui.dashboard.pdf.summary-statistics'),
      evaluated: t('oscrat.ui.dashboard.evaluated'),
      notEvaluated: t('oscrat.ui.dashboard.not-evaluated'),
      compliant: t('oscrat.ui.dashboard.compliant'),
      partiallyCompliant: t('oscrat.ui.dashboard.partially-compliant'),
      notCompliant: t('oscrat.ui.dashboard.not-compliant'),
      notApplicable: t('oscrat.ui.dashboard.not-applicable'),
      requirementsStatusSummary: t('oscrat.ui.dashboard.pdf.requirements-status-summary'),
      id: t('oscrat.ui.dashboard.pdf.id'),
      requirement: t('oscrat.ui.dashboard.pdf.requirement'),
      status: t('oscrat.ui.dashboard.pdf.status'),
      conformity: t('oscrat.ui.dashboard.pdf.conformity'),
      page: t('oscrat.ui.dashboard.pdf.page'),
      craReference: t('oscrat.ui.dashboard.pdf.cra-reference'),
      hint: t('oscrat.ui.dashboard.pdf.hint'),
      questionsAndAnswers: t('oscrat.ui.dashboard.pdf.questions-and-answers'),
      answer: t('oscrat.ui.dashboard.pdf.answer'),
      yes: t('oscrat.ui.dashboard.pdf.yes'),
      no: t('oscrat.ui.dashboard.pdf.no'),
      additionalInfo: t('oscrat.ui.dashboard.pdf.additional-info'),
      evidence: t('oscrat.ui.dashboard.pdf.evidence'),
      evidenceAttached: t('oscrat.ui.dashboard.pdf.evidence-attached'),
      noAnswerProvided: t('oscrat.ui.dashboard.pdf.no-answer-provided'),
      detailedAssessment: t('oscrat.ui.dashboard.pdf.detailed-assessment'),
      area: t('oscrat.ui.dashboard.area'),
    };

    await exportComplianceToPDF(
      complianceData,
      complianceState,
      team.id,
      team.name,
      undefined,
      pdfTranslations,
      (key: string) => t(key, { ns: complianceNamespace })
    );
  };

  const handleGoToAssessment = () => {
    router.push(`/teams/${team.slug}/compliance`);
  };

  if (!ready) return null;

  return (
    <>
      <div className="flex flex-col pb-6">
        <h2 className="mb-2 text-xl font-semibold">{t('dashboard')}</h2>
      </div>
      <div className="space-y-6">
        {shouldShowCompletedAppCheck && completedCraForm?.highestRiskLevel && (
          <CompletedAppCheck riskLevel={completedCraForm.highestRiskLevel} />
        )}
        {showCharts && complianceState && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                {t('oscrat.ui.team-compliance-assessment')}
              </h2>
              <div className="flex items-center gap-3">
                {!complianceState.completed && (
                  <button
                    onClick={handleGoToAssessment}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <FaPlayCircle />
                    {complianceState.started 
                      ? t('oscrat.ui.dashboard.continue-assessment')
                      : t('oscrat.ui.dashboard.start-assessment')
                    }
                  </button>
                )}
                {complianceState.completed && (
                  <button
                    onClick={handleExportPDF}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <FaDownload />
                    {t('oscrat.ui.dashboard.export-pdf')}
                  </button>
                )}
              </div>
            </div>
            <ComplianceCharts
              complianceData={complianceData}
              state={complianceState}
              complianceNamespace={complianceNamespace}
            />
          </div>
        )}
        {/* <TasksAndProducts /> */}
        <RecentActivities />
      </div>
    </>
  );
};

TeamDashboard.getLayout = withTeamLayout;

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const { locale } = context;
  const { getAllComplianceNamespaces } = await import('@/lib/compliance/translations');
  
  const namespaces = ['common', ...getAllComplianceNamespaces()];

  return {
    props: {
      ...(locale ? await serverSideTranslations(locale, namespaces) : {}),
    },
  };
}

export default TeamDashboard;
