import React, { useMemo } from 'react';
import { useTranslation } from 'next-i18next';
import { GetServerSidePropsContext } from 'next';
import { useSession } from 'next-auth/react';
import { withTeamLayout } from '@/lib/layout-helpers';
import { useTeamContext } from '@/context/TeamContext';
import { Loading, Breadcrumb } from '@/components/shared';
import Header from '@/components/oscrat/shared/header';
import { ComplianceAssessmentWrapper } from '@/components/compliance';
import { useComplianceData } from '@/hooks/useComplianceData';
import { useOrgCompliance } from '@/hooks/oscrat/useOrgCompliance';
import { getRoleForTeam } from '@/lib/compliance/utils';
import { COMPLIANCE_TYPES } from '@/lib/compliance/translations';
import {
  useAssessments,
  useOscratAssessment,
} from '@/hooks/oscrat/useOscratAssessment';
import { useLatestAssessment } from '@/hooks/oscrat/useLatestAssessment';
import { transformOrgAssessmentToComplianceState } from '@/utils/compliance';
import { ComplianceState } from '@/types/compliance';
import { OscratAssessmentType } from '@oscrat/model';

const TeamCompliancePage = () => {
  const { t, ready } = useTranslation('common');
  const { teamContext } = useTeamContext();
  const { data: session } = useSession();

  const team = teamContext.team;
  if (!team) return null;

  const { complianceData, isLoading } = useComplianceData({
    teamSlug: team.slug,
    teamRole: team.orgRoles[0],
    complianceType: COMPLIANCE_TYPES.TEAM,
    enabled: !!team,
  });

  const { assessments } = useAssessments(team.slug);
  const latestOrgAssessmentId = useLatestAssessment(
    assessments,
    OscratAssessmentType.ORG
  );
  const { assessment: assessmentDetail } = useOscratAssessment(
    team.slug,
    latestOrgAssessmentId || '',
    { enabled: !!latestOrgAssessmentId }
  );

  const { resetAssessment } = useOrgCompliance({
    teamSlug: team.slug,
    teamId: team.id,
    teamRole: team.orgRoles[0],
    userId: session?.user?.id,
  });

  const computedComplianceState = useMemo<ComplianceState | null>(() => {
    if (assessmentDetail?.rawData) {
      return transformOrgAssessmentToComplianceState(
        assessmentDetail.rawData,
        team.orgRoles[0]
      );
    }

    if (typeof window === 'undefined') return null;
    const storageKey = `team_compliance_${team.id}`;
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        return JSON.parse(saved) as ComplianceState;
      } catch {
        localStorage.removeItem(storageKey);
      }
    }
    return null;
  }, [assessmentDetail, team.id, team.orgRoles]);

  const hasStartedAssessment =
    !!computedComplianceState?.started && !computedComplianceState.completed;
  const isAssessmentCompleted = !!computedComplianceState?.completed;

  const handleReset = async () => {
    await resetAssessment();
    if (typeof window !== 'undefined') {
      localStorage.removeItem(`team_compliance_${team.id}`);
    }
  };

  if (isLoading || !complianceData || !ready) {
    return <Loading />;
  }

  const breadcrumbItems = [
    {
      label: team.name,
      href: `/organization/${team.slug}/dashboard`,
    },
    {
      label: t('oscrat.ui.team-compliance-assessment'),
      current: true,
    },
  ];

  return (
    <div className="max-w-7xl p-6">
      <Breadcrumb items={breadcrumbItems} />
      <Header
        title={t('oscrat.ui.team-compliance-assessment')}
        subtitle={t('oscrat.ui.team-compliance-assessment-description', {
          teamName: team.name,
        })}
      />

      <ComplianceAssessmentWrapper
        complianceData={complianceData}
        teamSlug={team.slug}
        teamId={team.id}
        teamRole={getRoleForTeam(team.orgRoles[0])}
        teamName={team.name}
        productName={team.name}
        complianceType={COMPLIANCE_TYPES.TEAM}
        isAssessmentStarted={hasStartedAssessment}
        isAssessmentCompleted={isAssessmentCompleted}
        onReset={handleReset}
      />
    </div>
  );
};

TeamCompliancePage.getLayout = withTeamLayout;

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const { getCommonServerSideProps } = await import('@/lib/server-helpers');
  const { getAllComplianceNamespaces } = await import(
    '@/lib/compliance/translations'
  );

  return getCommonServerSideProps(context, getAllComplianceNamespaces());
}

export default TeamCompliancePage;
