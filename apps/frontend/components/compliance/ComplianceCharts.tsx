import React, { useMemo } from 'react';
import { useTranslation } from 'next-i18next';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { ComplianceArea, ComplianceState } from '@/types/compliance';
import { ComplianceNamespace } from '@/lib/compliance/translations';
import { CONFORMITY_STATUS } from '@/constants/conformityStatuses';
import { computeRequirementsStatus } from '@/utils/compliance';

ChartJS.register(ArcElement, Tooltip, Legend);

interface ComplianceChartsProps {
  complianceData: ComplianceArea[];
  state: ComplianceState;
  complianceNamespace: ComplianceNamespace;
}

const ComplianceCharts: React.FC<ComplianceChartsProps> = ({
  complianceData,
  state,
  complianceNamespace,
}) => {
  const { t, ready } = useTranslation(['common', complianceNamespace]);

  const requirementsStatus = useMemo(
    () => computeRequirementsStatus(complianceData, state.assessments, t, complianceNamespace),
    [complianceData, state.assessments, t, complianceNamespace]
  );

  const chartData = useMemo(() => {
    const evaluated = requirementsStatus.filter(r => r.isEvaluated).length;
    const notEvaluated = requirementsStatus.length - evaluated;

    const compliant = requirementsStatus.filter(r => r.conformityStatus === CONFORMITY_STATUS.FULLY_COMPLIANT).length;
    const partiallyCompliant = requirementsStatus.filter(r => r.conformityStatus === CONFORMITY_STATUS.PARTIALLY_COMPLIANT).length;
    const notCompliant = requirementsStatus.filter(r => r.conformityStatus === CONFORMITY_STATUS.NOT_COMPLIANT).length;
    const notApplicable = requirementsStatus.filter(r => r.conformityStatus === CONFORMITY_STATUS.NOT_APPLICABLE).length;

    return {
      evaluation: {
        labels: [t('oscrat.ui.dashboard.evaluated'), t('oscrat.ui.dashboard.not-evaluated')],
        data: [evaluated, notEvaluated],
        colors: ['#10b981', '#ef4444'],
      },
      conformity: {
        labels: [
          t('oscrat.ui.dashboard.compliant'),
          t('oscrat.ui.dashboard.partially-compliant'),
          t('oscrat.ui.dashboard.not-compliant'),
          t('oscrat.ui.dashboard.not-applicable'),
        ],
        data: [compliant, partiallyCompliant, notCompliant, notApplicable],
        colors: ['#10b981', '#f59e0b', '#ef4444', '#9ca3af'],
      },
    };
  }, [requirementsStatus, t]);

  const overallProgress = useMemo(() => {
    if (requirementsStatus.length === 0) return 0;
    
    const totalProgress = requirementsStatus.reduce((sum, req) => {
      return sum + (req.isEvaluated ? 100 : req.completionPercentage);
    }, 0);

    return Math.round(totalProgress / requirementsStatus.length);
  }, [requirementsStatus]);

  if (!ready) return null;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-medium text-gray-900">
            {t('oscrat.ui.dashboard.overall-progress')}
          </h3>
          <span className="text-2xl font-bold text-blue-600">
            {overallProgress}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div
            className="h-4 rounded-full bg-blue-600 transition-all duration-300"
            style={{ width: `${overallProgress}%` }}
          />
        </div>
        <p className="text-sm text-gray-600 mt-2">
          {requirementsStatus.filter(r => r.isEvaluated).length} of {requirementsStatus.length} {t('oscrat.ui.dashboard.requirements-evaluated')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {t('oscrat.ui.dashboard.evaluation-status')}
          </h3>
          <div className="h-64 flex items-center justify-center">
            <Pie
              data={{
                labels: chartData.evaluation.labels,
                datasets: [{
                  data: chartData.evaluation.data,
                  backgroundColor: chartData.evaluation.colors,
                  borderWidth: 2,
                  borderColor: '#ffffff',
                }],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom',
                  },
                },
              }}
            />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {t('oscrat.ui.dashboard.conformity-breakdown')}
          </h3>
          <div className="h-64 flex items-center justify-center">
            <Pie
              data={{
                labels: chartData.conformity.labels,
                datasets: [{
                  data: chartData.conformity.data,
                  backgroundColor: chartData.conformity.colors,
                  borderWidth: 2,
                  borderColor: '#ffffff',
                }],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom',
                  },
                },
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComplianceCharts;

