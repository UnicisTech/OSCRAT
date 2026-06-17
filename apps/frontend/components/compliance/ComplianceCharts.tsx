import React, { useMemo } from 'react';
import { useTranslation } from 'next-i18next';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { ComplianceArea, ComplianceState } from '@/types/compliance';
import { ComplianceNamespace } from '@/lib/compliance/translations';
import {
  CONFORMITY_STATUS,
  CONFORMITY_STATUS_ORDER,
  conformityStatusTranslationMap,
  getConformityStatusLabel,
  type ConformityStatus,
} from '@/constants/conformityStatuses';
import { computeRequirementsStatus, getStatusBadgeColor } from '@/utils/compliance';
import { FaCheckCircle, FaExclamationCircle, FaClock } from 'react-icons/fa';
import type { Task } from '@oscrat/model';
import { TaskOriginType, TaskStatus } from '@oscrat/model';
import { TASK_STATUS_TRANSLATION_MAP } from '@/constants/taskStatuses';

ChartJS.register(ArcElement, Tooltip, Legend);

interface ComplianceChartsProps {
  complianceData: ComplianceArea[];
  state: ComplianceState;
  complianceNamespace: ComplianceNamespace;
  tasks?: Task[];
}

const PIE_OPTIONS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { position: 'bottom' as const } },
};

const CONFORMITY_STATUS_COLORS: Record<ConformityStatus, string> = {
  [CONFORMITY_STATUS.FULLY_COMPLIANT]: '#10b981',
  [CONFORMITY_STATUS.PARTIALLY_COMPLIANT]: '#f59e0b',
  [CONFORMITY_STATUS.NOT_COMPLIANT]: '#ef4444',
  [CONFORMITY_STATUS.NOT_APPLICABLE]: '#9ca3af',
  [CONFORMITY_STATUS.IN_EVALUATION]: '#3b82f6',
  [CONFORMITY_STATUS.NOT_EVALUATED]: '#d1d5db',
};

const TASK_PIE_COLORS = [
  '#93c5fd',
  '#60a5fa',
  '#3b82f6',
  '#1d4ed8',
  '#fde68a',
  '#fcd34d',
  '#f59e0b',
  '#b45309',
];

const TASK_PIE_OPTIONS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: (ctx: { label?: string; parsed: number }) =>
          `${ctx.label ?? ''}: ${ctx.parsed}`,
      },
    },
  },
};

const ComplianceCharts: React.FC<ComplianceChartsProps> = ({
  complianceData,
  state,
  complianceNamespace,
  tasks,
}) => {
  const { t, ready } = useTranslation(['common', complianceNamespace]);

  const requirementsStatus = useMemo(
    () => computeRequirementsStatus(complianceData, state.assessments, t, complianceNamespace),
    [complianceData, state.assessments, t, complianceNamespace]
  );

  const chartData = useMemo(() => {
    const evaluated = requirementsStatus.filter(r => r.isEvaluated).length;
    const notEvaluated = requirementsStatus.length - evaluated;

    const countForStatus = (status: ConformityStatus) =>
      status === CONFORMITY_STATUS.IN_EVALUATION
        ? requirementsStatus.filter(r => r.conformityStatus.startsWith(status)).length
        : requirementsStatus.filter(r => r.conformityStatus === status).length;

    return {
      evaluation: {
        labels: [t('oscrat.ui.dashboard.evaluated'), t('oscrat.ui.dashboard.not-evaluated')],
        data: [evaluated, notEvaluated],
        colors: ['#10b981', '#ef4444'],
      },
      conformity: {
        labels: CONFORMITY_STATUS_ORDER.map((status) => t(conformityStatusTranslationMap[status])),
        data: CONFORMITY_STATUS_ORDER.map(countForStatus),
        colors: CONFORMITY_STATUS_ORDER.map((status) => CONFORMITY_STATUS_COLORS[status]),
      },
    };
  }, [requirementsStatus, t]);

  const taskChartData = useMemo(() => {
    if (!tasks || tasks.length === 0) return null;

    const statusOrder = [
      TaskStatus.TODO,
      TaskStatus.PLANNED,
      TaskStatus.IN_PROGRESS,
      TaskStatus.DONE,
    ] as const;

    const segments = statusOrder.flatMap((status, statusIdx) => {
      const autoCount = tasks.filter(
        (task) => task.originType === TaskOriginType.AUTOMATIC && task.status === status
      ).length;
      const manualCount = tasks.filter(
        (task) => task.originType !== TaskOriginType.AUTOMATIC && task.status === status
      ).length;

      const statusLabel = t(TASK_STATUS_TRANSLATION_MAP[status]);
      const autoLabel = `${t('oscrat.ui.dashboard.auto-generated')} — ${statusLabel}`;
      const manualLabel = `${t('oscrat.ui.dashboard.manual')} — ${statusLabel}`;
      const base = statusIdx * 2;

      return [
        { key: `auto-${status}`, label: autoLabel, count: autoCount, color: TASK_PIE_COLORS[base] },
        { key: `manual-${status}`, label: manualLabel, count: manualCount, color: TASK_PIE_COLORS[base + 1] },
      ];
    });

    const nonZero = segments.filter((s) => s.count > 0);
    if (nonZero.length === 0) return null;

    return {
      legendRows: segments,
      pie: {
        labels: nonZero.map((s) => s.label),
        data: nonZero.map((s) => s.count),
        colors: nonZero.map((s) => s.color),
      },
    };
  }, [tasks, t]);

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
        {/* Chart A: Evaluation Status */}
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
              options={PIE_OPTIONS}
            />
          </div>
        </div>

        {/* Chart A breakdown: Conformity Status (includes Not Evaluated + In Evaluation) */}
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
              options={PIE_OPTIONS}
            />
          </div>
        </div>
      </div>

      {/* Chart B: Task Distribution */}
      {taskChartData && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {t('oscrat.ui.dashboard.task-distribution')}
          </h3>
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-center">
            <div className="mx-auto h-72 w-full max-w-xs shrink-0">
              <Pie
                data={{
                  labels: taskChartData.pie.labels,
                  datasets: [
                    {
                      data: taskChartData.pie.data,
                      backgroundColor: taskChartData.pie.colors,
                      borderWidth: 2,
                      borderColor: '#ffffff',
                    },
                  ],
                }}
                options={TASK_PIE_OPTIONS}
              />
            </div>
            <ul className="flex min-w-0 flex-1 flex-col gap-2 text-sm text-gray-800 dark:text-gray-200">
              {taskChartData.legendRows.map((row) => (
                <li key={row.key} className="flex items-center gap-3">
                  <span
                    className="h-3 w-3 shrink-0 rounded-sm"
                    style={{ backgroundColor: row.color }}
                    aria-hidden
                  />
                  <span className="min-w-0 flex-1 leading-snug">{row.label}</span>
                  <span className="shrink-0 tabular-nums font-medium text-gray-900 dark:text-gray-100">
                    {row.count}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Status Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            {t('oscrat.ui.dashboard.requirements-status')}
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('oscrat.ui.dashboard.requirement-id')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('oscrat.ui.dashboard.requirement-name')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('oscrat.ui.dashboard.area')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('oscrat.ui.dashboard.evaluation-status')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('oscrat.ui.dashboard.conformity-status')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {requirementsStatus.map((req) => {
                const statusIcon = req.conformityStatus === CONFORMITY_STATUS.FULLY_COMPLIANT
                  ? <FaCheckCircle className="text-green-500" />
                  : req.conformityStatus.startsWith(CONFORMITY_STATUS.IN_EVALUATION)
                  ? <FaClock className="text-blue-500" />
                  : req.conformityStatus === CONFORMITY_STATUS.NOT_COMPLIANT
                  ? <FaExclamationCircle className="text-red-500" />
                  : req.conformityStatus === CONFORMITY_STATUS.NOT_EVALUATED
                  ? <FaExclamationCircle className="text-gray-400" />
                  : null;

                return (
                  <tr key={req.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {req.id}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {req.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {req.areaName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        req.isEvaluated ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {req.isEvaluated ? t('oscrat.ui.dashboard.evaluated') : t('oscrat.ui.dashboard.not-evaluated')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(req.conformityStatus)}`}>
                        {statusIcon}
                        {getConformityStatusLabel(req.conformityStatus, t)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ComplianceCharts;
