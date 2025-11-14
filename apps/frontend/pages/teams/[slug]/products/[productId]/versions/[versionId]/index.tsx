import TabsManager from '@/components/oscrat/versions/versionDetails/tabs/TabManager';
import { withProductDetailLayout } from '@/lib/layout-helpers';
import TABS_CONFIG from '@/components/oscrat/versions/versionDetails/tabs/tabs';
import Version from '@/components/oscrat/versions/versionDetails/version';
import ConformityRow from '@/components/oscrat/versions/versionDetails/conformityRow';
import { Breadcrumb } from '@/components/shared';
import { useTranslation } from 'next-i18next';
import { useOscratProject } from '@/hooks/oscrat/useOscratProject';
import { useVersionContext } from '@/context/VersionContext';
import { useOscratVersion } from '@/hooks/oscrat/useOscratVersion';
import { ComplianceCharts, exportComplianceToPDF } from '@/components/compliance';
import { useComplianceData } from '@/hooks/useComplianceData';
import { useTeamContext } from '@/context/TeamContext';
import { useMemo } from 'react';
import { ComplianceState } from '@/types/compliance';
import { getComplianceNamespace, COMPLIANCE_NAMESPACES } from '@/lib/compliance/translations';
import { getRoleForTeam } from '@/lib/compliance/utils';
import { FaDownload, FaPlayCircle } from 'react-icons/fa';
import { OscratOrganizationRole } from '@oscrat/model';
import { useRouter } from 'next/router';

export default function Index() {
  const { t, ready } = useTranslation('common');
  const router = useRouter();
  const { teamId, productId, versionId } = useVersionContext();
  const { teamContext } = useTeamContext();

  const { project } = useOscratProject(teamId, productId);
  const { version: versionData } = useOscratVersion(
    teamId,
    productId,
    versionId
  );

  const team = teamContext.team;

  const { complianceData, isLoading: isComplianceLoading } = useComplianceData({
    teamSlug: team?.slug || '',
    teamRole: team?.orgRoles[0] || OscratOrganizationRole.MANUFACTURER,
    complianceType: 'version',
    enabled: !!team && !!versionData,
  });

  const complianceState = useMemo<ComplianceState | null>(() => {
    if (!team || !versionId) return null;
    
    const storageKey = `compliance_${versionId}`;
    const saved = localStorage.getItem(storageKey);
    
    if (saved) {
      try {
        return JSON.parse(saved) as ComplianceState;
      } catch {
        localStorage.removeItem(storageKey);
      }
    }
    
    // Initialize empty state for newly created versions 
    return {
      productId: versionId,
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
  }, [team, versionId]);

  const complianceNamespace = useMemo(() => {
    if (!team?.orgRoles[0]) return COMPLIANCE_NAMESPACES.VERSION_MANUFACTURER;
    return getComplianceNamespace(getRoleForTeam(team.orgRoles[0]), 'version');
  }, [team]);

  if (!ready || !project || !versionData) {
    return null;
  }

  const breadcrumbItems = [
    {
      label: t('oscrat.ui.products'),
      href: `/teams/${teamId}/products`,
    },
    {
      label: project.name,
      href: `/teams/${teamId}/products/${productId}`,
    },
    {
      label: versionData.version,
      href: `/teams/${teamId}/products/${productId}/versions/${versionId}`,
      current: true,
    },
  ];

  const showCharts = !isComplianceLoading && complianceData && complianceState && complianceData.length > 0;

  const handleNavigateToCompliance = () => {
    router.push(`/teams/${team?.slug}/products/${productId}/versions/${versionId}/compliance`);
  };

  const handleExportPDF = async () => {
    if (!complianceData || !complianceState || !team) return;

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
      versionId,
      team.name,
      `${project.name} (${versionData.version})`,
      pdfTranslations,
      (key: string) => t(key, { ns: complianceNamespace })
    );
  };

  return (
    <>
      <Breadcrumb items={breadcrumbItems} />
      <Version />
      <ConformityRow />
      {showCharts && complianceState && (
        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              {t('oscrat.ui.compliance-assessment')}
            </h2>
            <div className="flex items-center gap-3">
              {!complianceState.completed && (
                <button
                  onClick={handleNavigateToCompliance}
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
      <TabsManager tabs={TABS_CONFIG} />
    </>
  );
}

Index.getLayout = withProductDetailLayout;

export { getCommonServerSideProps as getServerSideProps } from '@/lib/server-helpers';
