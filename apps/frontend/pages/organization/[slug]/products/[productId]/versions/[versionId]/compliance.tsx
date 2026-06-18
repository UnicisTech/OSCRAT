import React, { useMemo } from 'react';
import { useTranslation } from 'next-i18next';
import { GetServerSidePropsContext } from 'next';
import { withProductDetailLayout } from '@/lib/layout-helpers';
import { useTeamContext } from '@/context/TeamContext';
import { useVersionContext } from '@/context/VersionContext';
import { useOscratProject } from '@/hooks/oscrat/useOscratProject';
import { useOscratVersion } from '@/hooks/oscrat/useOscratVersion';
import { Loading, Breadcrumb } from '@/components/shared';
import { ComplianceAssessmentWrapper } from '@/components/compliance';
import { useComplianceData } from '@/hooks/useComplianceData';
import { getRoleForTeam } from '@/lib/compliance/utils';
import { COMPLIANCE_TYPES } from '@/lib/compliance/translations';
import {
  useAssessments,
  useOscratAssessment,
} from '@/hooks/oscrat/useOscratAssessment';
import { useLatestAssessment } from '@/hooks/oscrat/useLatestAssessment';
import { transformVersionAssessmentToComplianceState } from '@/utils/compliance';
import { OscratAssessmentType } from '@oscrat/model';

const CompliancePage = () => {
  const { t, ready } = useTranslation('common');
  const { teamContext } = useTeamContext();
  const { teamId, productId, versionId } = useVersionContext();
  const { project } = useOscratProject(teamId, productId);
  const { version: versionData } = useOscratVersion(
    teamId,
    productId,
    versionId
  );

  const team = teamContext.team;
  if (!team) return null;

  const assessmentScope = useMemo(
    () => ({ productId, versionId }),
    [productId, versionId]
  );

  const { assessments, isLoading: isLoadingAssessments } = useAssessments(
    team.slug,
    assessmentScope,
    {
      enabled: !!team && !!versionData,
    }
  );

  const latestVersionComplianceId = useLatestAssessment(
    assessments,
    OscratAssessmentType.COMPLIANCE,
    assessmentScope
  );

  const { assessment: versionComplianceAssessment } = useOscratAssessment(
    team.slug,
    latestVersionComplianceId || '',
    { enabled: !!latestVersionComplianceId }
  );

  const hasStartedAssessment = useMemo(() => {
    if (!versionComplianceAssessment?.rawData) return false;
    const complianceState = transformVersionAssessmentToComplianceState(
      versionComplianceAssessment.rawData,
      productId,
      team.orgRoles[0]
    );
    return !!(complianceState?.started && !complianceState.completed);
  }, [versionComplianceAssessment?.rawData, productId, team.orgRoles]);

  const { complianceData, isLoading } = useComplianceData({
    teamSlug: team.slug,
    teamRole: team.orgRoles[0],
    complianceType: COMPLIANCE_TYPES.VERSION,
    enabled: !!team && !!versionData,
  });

  if (
    !ready ||
    isLoading ||
    isLoadingAssessments ||
    !complianceData ||
    !project ||
    !versionData
  ) {
    return <Loading />;
  }

  const breadcrumbItems = [
    {
      label: t('oscrat.ui.products'),
      href: `/organization/${team.slug}/products`,
    },
    {
      label: project.name,
      href: `/organization/${team.slug}/products/${productId}`,
    },
    {
      label: versionData.version,
      href: `/organization/${team.slug}/products/${productId}/versions/${versionId}`,
    },
    {
      label: t('oscrat.ui.compliance-assessment'),
      current: true,
    },
  ];

  return (
    <div className="max-w-7xl p-6">
      <Breadcrumb items={breadcrumbItems} />
      <div className="mb-8">
        <h1 className="text-content mb-2 text-2xl font-bold">
          {t('oscrat.ui.product-compliance-assessment')}
        </h1>
        <p className="text-content-secondary">
          {t('oscrat.ui.compliance-assessment-description', {
            productName: `${project.name} (${versionData.version})`,
          })}
        </p>
      </div>

      <ComplianceAssessmentWrapper
        complianceData={complianceData}
        productId={productId}
        versionId={versionId}
        teamSlug={team.slug}
        teamId={team.id}
        teamRole={getRoleForTeam(team.orgRoles[0])}
        teamName={team.name}
        productName={`${project.name} (${versionData.version})`}
        complianceType={COMPLIANCE_TYPES.VERSION}
        isAssessmentStarted={hasStartedAssessment}
      />
    </div>
  );
};

CompliancePage.getLayout = withProductDetailLayout;

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const { getCommonServerSideProps } = await import('@/lib/server-helpers');
  const { getAllComplianceNamespaces } = await import(
    '@/lib/compliance/translations'
  );

  return getCommonServerSideProps(context, getAllComplianceNamespaces());
}

export default CompliancePage;
