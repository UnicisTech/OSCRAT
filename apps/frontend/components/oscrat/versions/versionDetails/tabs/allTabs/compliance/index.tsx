import { useMemo, useState } from 'react';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { useVersionContext } from '@/context/VersionContext';
import { useTeamContext } from '@/context/TeamContext';
import { useOscratProject } from '@/hooks/oscrat/useOscratProject';
import { useOscratVersion } from '@/hooks/oscrat/useOscratVersion';
import { useComplianceData } from '@/hooks/useComplianceData';
import { useVersionCompliance } from '@/hooks/oscrat/useVersionCompliance';
import { ComplianceCharts, exportComplianceToPDF } from '@/components/compliance';
import { TabHeader, TabActionButton, TabLoading } from '@/components/oscrat/versions/versionDetails/tabs/allTabs/shared';
import ConfirmationModal from '@/components/oscrat/versions/versionDetails/tabs/allTabs/repository/confirmationModal';
import { getComplianceNamespace, COMPLIANCE_NAMESPACES } from '@/lib/compliance/translations';
import { getRoleForTeam } from '@/lib/compliance/utils';
import { FaDownload, FaPlayCircle, FaRedo } from 'react-icons/fa';
import { OscratOrganizationRole } from '@oscrat/model';

export default function Compliance() {
  const { t, ready } = useTranslation('common');
  const router = useRouter();
  const { data: session } = useSession();
  const { teamId, productId, versionId } = useVersionContext();
  const { teamContext, slug: teamSlug } = useTeamContext();
  
  const [isResetModalOpen, setResetModalOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const { project } = useOscratProject(teamId, productId);
  const { version: versionData } = useOscratVersion(teamId, productId, versionId);

  const team = teamContext.team;

  const { complianceData, isLoading: isLoadingData } = useComplianceData({
    teamSlug: team?.slug || '',
    teamRole: team?.orgRoles[0] || OscratOrganizationRole.MANUFACTURER,
    complianceType: 'version',
    enabled: !!team && !!versionData,
  });

  const { complianceState: dbComplianceState, resetAssessment } = useVersionCompliance({
    teamSlug,
    productId,
    versionId,
    teamRole: team?.orgRoles[0] as OscratOrganizationRole,
    userId: session?.user?.id,
  });

  const isLoading = isLoadingData;

  const complianceNamespace = useMemo(() => {
    if (!team?.orgRoles[0]) return COMPLIANCE_NAMESPACES.VERSION_MANUFACTURER;
    return getComplianceNamespace(getRoleForTeam(team.orgRoles[0]), 'version');
  }, [team]);

  // Provide default empty state when no assessment exists in database
  const complianceState = useMemo(() => {
    if (dbComplianceState) return dbComplianceState;
    if (!team?.orgRoles[0]) return null;
    
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
  }, [dbComplianceState, versionId, team?.orgRoles]);

  const handleNavigateToCompliance = () => {
    router.push(`/teams/${team?.slug}/products/${productId}/versions/${versionId}/compliance`);
  };

  const handleExportPDF = async () => {
    if (!complianceData || !complianceState || !team || !project || !versionData) return;

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

  const handleResetClick = () => {
    setResetModalOpen(true);
  };

  const handleResetConfirm = async () => {
    setIsResetting(true);
    try {
      await resetAssessment();
    } finally {
      setIsResetting(false);
      setResetModalOpen(false);
    }
  };

  const handleResetCancel = () => {
    setResetModalOpen(false);
  };

  if (!ready) return null;

  if (isLoading) {
    return <TabLoading />;
  }

  const showCharts = complianceData && complianceState && complianceData.length > 0;

  if (!showCharts) {
    return (
      <div className="flex w-full flex-col items-center rounded-lg border border-gray-400 bg-white p-8">
        <p className="text-gray-500">{t('oscrat.ui.versions.compliance.no-data')}</p>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col rounded-lg border border-gray-400 bg-white p-4">
      <div className="w-full">
        <TabHeader title={t('oscrat.ui.compliance-assessment')}>
          {!complianceState.completed && (
            <TabActionButton
              onClick={handleNavigateToCompliance}
              icon={<FaPlayCircle />}
            >
              {complianceState.started
                ? t('oscrat.ui.dashboard.continue-assessment')
                : t('oscrat.ui.dashboard.start-assessment')}
            </TabActionButton>
          )}
          {complianceState.completed && (
            <>
              <TabActionButton
                onClick={handleExportPDF}
                icon={<FaDownload />}
              >
                {t('oscrat.ui.dashboard.export-pdf')}
              </TabActionButton>
              <TabActionButton
                onClick={handleResetClick}
                icon={<FaRedo />}
                variant="secondary"
              >
                {t('oscrat.ui.dashboard.reset-assessment')}
              </TabActionButton>
            </>
          )}
        </TabHeader>
        <ComplianceCharts
          complianceData={complianceData}
          state={complianceState}
          complianceNamespace={complianceNamespace}
        />
      </div>

      <ConfirmationModal
        isOpen={isResetModalOpen}
        onClose={handleResetCancel}
        onConfirm={handleResetConfirm}
        title={t('oscrat.ui.dashboard.reset-assessment-title')}
        message={t('oscrat.ui.dashboard.confirm-reset-assessment')}
        confirmText={t('oscrat.ui.dashboard.reset-assessment')}
        cancelText={t('cancel')}
        isLoading={isResetting}
        variant="warning"
      />
    </div>
  );
}

