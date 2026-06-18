import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { GetServerSidePropsContext } from 'next';
import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import { withTeamLayout } from '@/lib/layout-helpers';
import Header from '@/components/oscrat/shared/header';
import CompletedAppCheck from '@/components/oscrat/dashboard/CompletedAppCheck';
// import TasksAndProducts from '@/components/oscrat/dashboard/TasksAndProducts';
import RecentActivities from '@/components/oscrat/dashboard/RecentActivities';
import {
  ComplianceCharts,
  exportComplianceToPDF,
} from '@/components/compliance';
import { useComplianceData } from '@/hooks/useComplianceData';
import { useTeamContext } from '@/context/TeamContext';
import { ComplianceState } from '@/types/compliance';
import { getComplianceNamespace } from '@/lib/compliance/translations';
import { getRoleForTeam } from '@/lib/compliance/utils';
import { FaDownload, FaPlayCircle } from 'react-icons/fa';
import { OscratAssessmentType } from '@oscrat/model';
import { loadFormState } from '@/utils/craForm';
import type { FormState } from '@/types/craForm';
import {
  useAssessments,
  useOscratAssessment,
} from '@/hooks/oscrat/useOscratAssessment';
import { useLatestAssessment } from '@/hooks/oscrat/useLatestAssessment';
import { transformOrgAssessmentToComplianceState } from '@/utils/compliance';
import { buildPDFTranslations } from '@/lib/compliance/pdfTranslations';
import useTasks from '@/hooks/useTasks';
import Button from '@/components/button';

const TeamDashboard = () => {
  const { teamContext } = useTeamContext();
  const team = teamContext.team!;
  const router = useRouter();

  const complianceNamespace = useMemo(() => {
    return getComplianceNamespace(getRoleForTeam(team.orgRoles[0]), 'team');
  }, [team.orgRoles]);

  const { t, ready } = useTranslation(['common', complianceNamespace]);

  // Check localStorage for completed CRA form data (before product creation)
  const [completedCraForm, setCompletedCraForm] = useState<FormState | null>(
    null
  );

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

  const { tasks: teamTasks } = useTasks(team.slug);

  const { assessments, isLoading: isLoadingAssessments } = useAssessments(
    team.slug
  );

  const latestOrgAssessmentId = useLatestAssessment(
    assessments,
    OscratAssessmentType.ORG
  );

  // Fetch the detailed assessment with rawData
  const { assessment: assessmentDetail, isLoading: isLoadingAssessmentDetail } =
    useOscratAssessment(team.slug, latestOrgAssessmentId || '', {
      enabled: !!latestOrgAssessmentId,
    });

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

  const showCharts =
    !isComplianceLoading &&
    !isLoadingAssessments &&
    !isLoadingAssessmentDetail &&
    complianceData &&
    complianceData.length > 0;

  const handleExportPDF = async () => {
    if (!complianceData || !complianceState || !ready) return;

    const pdfTranslations = buildPDFTranslations(t);

    await exportComplianceToPDF(
      complianceData,
      complianceState,
      team.id,
      team.name,
      undefined,
      pdfTranslations,
      (key: string) => t(key, { ns: complianceNamespace }),
      false
    );
  };

  const handleGoToAssessment = () => {
    router.push(`/organization/${team.slug}/compliance`);
  };

  if (!ready) return null;

  return (
    <>
      <Header title={t('dashboard')} />
      <div className="space-y-8">
        {shouldShowCompletedAppCheck && completedCraForm?.highestRiskLevel && (
          <CompletedAppCheck riskLevel={completedCraForm.highestRiskLevel} />
        )}
        {showCharts && complianceState && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-content text-h6 font-bold">
                {t('oscrat.ui.team-compliance-assessment')}
              </h2>
              <div className="flex items-center gap-3">
                {!complianceState.completed && (
                  <Button
                    variant="primary"
                    onClick={handleGoToAssessment}
                    startIcon={<FaPlayCircle />}
                  >
                    {complianceState.started
                      ? t('oscrat.ui.dashboard.continue-assessment')
                      : t('oscrat.ui.dashboard.start-assessment')}
                  </Button>
                )}
                {complianceState.completed && (
                  <Button
                    variant="primary"
                    onClick={handleExportPDF}
                    startIcon={<FaDownload />}
                  >
                    {t('oscrat.ui.dashboard.export-pdf')}
                  </Button>
                )}
              </div>
            </div>
            <ComplianceCharts
              complianceData={complianceData}
              state={complianceState}
              complianceNamespace={complianceNamespace}
              tasks={teamTasks}
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
  const { getAllComplianceNamespaces } = await import(
    '@/lib/compliance/translations'
  );

  const namespaces = ['common', ...getAllComplianceNamespaces()];

  return {
    props: {
      ...(locale ? await serverSideTranslations(locale, namespaces) : {}),
    },
  };
}

export default TeamDashboard;
