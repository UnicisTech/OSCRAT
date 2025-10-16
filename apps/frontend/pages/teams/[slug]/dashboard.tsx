import { useTranslation } from 'next-i18next';
import React, { useState, useEffect, useMemo } from 'react';
import { withTeamLayout } from '@/lib/layout-helpers';
import CompletedAppCheck from '@/components/oscrat/dashboard/CompletedAppCheck';
import TasksAndProducts from '@/components/oscrat/dashboard/TasksAndProducts';
import RecentActivities from '@/components/oscrat/dashboard/RecentActivities';
import { ComplianceCharts, exportComplianceToPDF } from '@/components/compliance';
import { useComplianceData } from '@/hooks/useComplianceData';
import { useTeamContext } from '@/context/TeamContext';
import { ComplianceState } from '@/types/compliance';
import { getComplianceNamespace, COMPLIANCE_NAMESPACES } from '@/lib/compliance/translations';
import { getRoleForTeam } from '@/lib/compliance/utils';
import { FaDownload } from 'react-icons/fa';
import { OscratOrganizationRole } from '@oscrat/model';

const TeamDashboard = () => {
  const { t } = useTranslation('common');
  const { teamContext } = useTeamContext();
  const team = teamContext.team;

  const [completedFormData, setCompletedFormData] = useState<{
    completed: boolean;
    riskLevel: string;
  } | null>(null);

  const shouldShowCompletedAppCheck = completedFormData?.completed && completedFormData.riskLevel;

  useEffect(() => {
    const savedState = localStorage.getItem('craFormState');
    if (!savedState) return;

    try {
      const parsed = JSON.parse(savedState);
      if (parsed.completed && parsed.highestRiskLevel) {
        setCompletedFormData({
          completed: true,
          riskLevel: parsed.highestRiskLevel
        });
      }
    } catch (error) {
      console.error("Failed to parse saved state:", error);
    }
  }, []);

  const { complianceData, isLoading: isComplianceLoading } = useComplianceData({
    teamSlug: team?.slug || '',
    teamRole: team?.orgRoles[0] || OscratOrganizationRole.MANUFACTURER,
    complianceType: 'team',
    enabled: !!team,
  });

  const complianceState = useMemo<ComplianceState | null>(() => {
    if (!team) return null;
    
    const storageKey = `team_compliance_${team.id}`;
    const saved = localStorage.getItem(storageKey);
    
    if (saved) {
      try {
        return JSON.parse(saved) as ComplianceState;
      } catch {
        return null;
      }
    }
    
    return null;
  }, [team]);

  const complianceNamespace = useMemo(() => {
    if (!team?.orgRoles[0]) return COMPLIANCE_NAMESPACES.TEAM_MANUFACTURER;
    return getComplianceNamespace(getRoleForTeam(team.orgRoles[0]), 'team');
  }, [team]);

  const showCharts = !isComplianceLoading && complianceData && complianceState && complianceData.length > 0;

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
      team.id,
      team.name,
      team.name,
      pdfTranslations,
      (key: string) => t(key, { ns: complianceNamespace })
    );
  };

  return (
    <>
      <div className="flex flex-col pb-6">
        <h2 className="mb-2 text-xl font-semibold">{t('Dashboard')}</h2>
      </div>
      <div className="space-y-6">
        {shouldShowCompletedAppCheck && (
          <CompletedAppCheck riskLevel={completedFormData.riskLevel} />
        )}
        {showCharts && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                {t('oscrat.ui.team-compliance-assessment')}
              </h2>
              <button
                onClick={handleExportPDF}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FaDownload />
                {t('oscrat.ui.dashboard.export-pdf')}
              </button>
            </div>
            <ComplianceCharts
              complianceData={complianceData}
              state={complianceState}
              complianceNamespace={complianceNamespace}
            />
          </div>
        )}
        <TasksAndProducts />
        <RecentActivities />
      </div>
    </>
  );
};

TeamDashboard.getLayout = withTeamLayout;

export { getCommonServerSideProps as getServerSideProps } from '@/lib/server-helpers';

export default TeamDashboard;
