import React from 'react';
import { useTranslation } from 'next-i18next';
import { GetServerSidePropsContext } from 'next';
import { withProductDetailLayout } from '@/lib/layout-helpers';
import { useTeamContext } from '@/context/TeamContext';
import { useVersionContext } from '@/context/VersionContext';
import { useOscratProject } from '@/hooks/oscrat/useOscratProject';
import { useOscratVersion } from '@/hooks/oscrat/useOscratVersion';
import { Loading } from '@/components/shared';
import { ComplianceForm } from '@/components/compliance';
import { useComplianceData } from '@/hooks/useComplianceData';
import { getRoleForTeam } from '@/lib/compliance/utils';

const CompliancePage = () => {
  const { t, ready } = useTranslation('common');
  const { teamContext } = useTeamContext();
  const { teamId, productId, versionId } = useVersionContext();
  const { project } = useOscratProject(teamId, productId);
  const { version: versionData } = useOscratVersion(teamId, productId, versionId);

  const team = teamContext.team;
  if (!team) return null;

  const { complianceData, isLoading } = useComplianceData({
    teamSlug: team.slug,
    teamRole: team.orgRoles[0],
    complianceType: 'version',
    enabled: !!team && !!versionData,
  });

  if (!ready || isLoading || !complianceData || !project || !versionData) {
    return <Loading />;
  }

  return (
    <div className="max-w-7xl p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {t('oscrat.ui.compliance-assessment')}
        </h1>
        <p className="text-gray-600">
          {t('oscrat.ui.compliance-assessment-description', { 
            productName: `${project.name} (${versionData.version})`
          })}
        </p>
      </div>

      <ComplianceForm
        complianceData={complianceData}
        productId={productId}
        versionId={versionId}
        teamSlug={team.slug}
        teamId={team.id}
        teamRole={getRoleForTeam(team.orgRoles[0])}
        teamName={team.name}
        productName={`${project.name} (${versionData.version})`}
      />
    </div>
  );
};

CompliancePage.getLayout = withProductDetailLayout;

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const { getCommonServerSideProps } = await import('@/lib/server-helpers');
  const { getAllComplianceNamespaces } = await import('@/lib/compliance/translations');
  
  return getCommonServerSideProps(context, getAllComplianceNamespaces());
}

export default CompliancePage;
