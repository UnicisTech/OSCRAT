import React from 'react';
import { useTranslation } from 'next-i18next';
import { GetServerSidePropsContext } from 'next';
import { withTeamLayout } from '@/lib/layout-helpers';
import { useTeamContext } from '@/context/TeamContext';
import { Loading, Breadcrumb } from '@/components/shared';
import { ComplianceAssessmentWrapper } from '@/components/compliance';
import { useComplianceData } from '@/hooks/useComplianceData';
import { getRoleForTeam } from '@/lib/compliance/utils';
import { COMPLIANCE_TYPES } from '@/lib/compliance/translations';

const TeamCompliancePage = () => {
  const { t, ready } = useTranslation('common');
  const { teamContext } = useTeamContext();

  const team = teamContext.team;
  if (!team) return null;

  const { complianceData, isLoading } = useComplianceData({
    teamSlug: team.slug,
    teamRole: team.orgRoles[0],
    complianceType: COMPLIANCE_TYPES.TEAM,
    enabled: !!team,
  });

  if (isLoading || !complianceData || !ready) {
    return <Loading />;
  }

  const breadcrumbItems = [
    {
      label: team.name,
      href: `/teams/${team.slug}`,
    },
    {
      label: t('oscrat.ui.team-compliance-assessment'),
      current: true,
    },
  ];

  return (
    <div className="max-w-7xl p-6">
      <Breadcrumb items={breadcrumbItems} />
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2 dark:text-white">
          {t('oscrat.ui.team-compliance-assessment')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {t('oscrat.ui.team-compliance-assessment-description', { 
            teamName: team.name
          })}
        </p>
      </div>

      <ComplianceAssessmentWrapper
        complianceData={complianceData}
        teamSlug={team.slug}
        teamId={team.id}
        teamRole={getRoleForTeam(team.orgRoles[0])}
        teamName={team.name}
        productName={team.name}
        complianceType={COMPLIANCE_TYPES.TEAM}
      />
    </div>
  );
};

TeamCompliancePage.getLayout = withTeamLayout;

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const { getCommonServerSideProps } = await import('@/lib/server-helpers');
  const { getAllComplianceNamespaces } = await import('@/lib/compliance/translations');
  
  return getCommonServerSideProps(context, getAllComplianceNamespaces());
}

export default TeamCompliancePage;
