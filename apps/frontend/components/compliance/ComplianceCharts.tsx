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
import {
  computeRequirementsStatus,
  getStatusBadgeColor,
} from '@/utils/compliance';
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

// Semantic statuses keep meaning — values mirror the theme
// success / warning / danger / grey / primary / line tokens.
const CONFORMITY_STATUS_COLORS: Record<ConformityStatus, string> = {
  [CONFORMITY_STATUS.FULLY_COMPLIANT]: '#16A34A', // success — compliant
  [CONFORMITY_STATUS.PARTIALLY_COMPLIANT]: '#D97706', // warning — partially compliant
  [CONFORMITY_STATUS.NOT_COMPLIANT]: '#E53935', // danger — not compliant
  [CONFORMITY_STATUS.NOT_APPLICABLE]: '#9E9E9E', // grey/500 — not applicable
  [CONFORMITY_STATUS.IN_EVALUATION]: '#1976D2', // primary — in evaluation
  [CONFORMITY_STATUS.NOT_EVALUATED]: '#E0E0E0', // grey/300 — not evaluated
};

// Categorical chart palette — mirrors `theme.colors.chart` in tailwind.config.js
// (Chart.js needs hex values, so the tokens are referenced as literals here).
const CHART_PALETTE = {
  coral: '#FA938E',
  teal: '#51CCD0',
  blue: '#5BA5FF',
  grey: '#DADADA',
};

const TASK_PIE_COLORS = [
  CHART_PALETTE.coral,
  CHART_PALETTE.teal,
  CHART_PALETTE.blue,
  CHART_PALETTE.grey,
  CHART_PALETTE.coral,
  CHART_PALETTE.teal,
  CHART_PALETTE.blue,
  CHART_PALETTE.grey,
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
    () =>
      computeRequirementsStatus(
        complianceData,
        state.assessments,
        t,
        complianceNamespace
      ),
    [complianceData, state.assessments, t, complianceNamespace]
  );

  const chartData = useMemo(() => {
    const evaluated = requirementsStatus.filter((r) => r.isEvaluated).length;
    const notEvaluated = requirementsStatus.length - evaluated;

    const countForStatus = (status: ConformityStatus) =>
      status === CONFORMITY_STATUS.IN_EVALUATION
        ? requirementsStatus.filter((r) =>
            r.conformityStatus.startsWith(status)
          ).length
        : requirementsStatus.filter((r) => r.conformityStatus === status)
            .length;

    return {
      evaluation: {
        labels: [
          t('oscrat.ui.dashboard.evaluated'),
          t('oscrat.ui.dashboard.not-evaluated'),
        ],
        data: [evaluated, notEvaluated],
        colors: [CHART_PALETTE.coral, CHART_PALETTE.teal],
      },
      conformity: {
        labels: CONFORMITY_STATUS_ORDER.map((status) =>
          t(conformityStatusTranslationMap[status])
        ),
        data: CONFORMITY_STATUS_ORDER.map(countForStatus),
        colors: CONFORMITY_STATUS_ORDER.map(
          (status) => CONFORMITY_STATUS_COLORS[status]
        ),
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
        (task) =>
          task.originType === TaskOriginType.AUTOMATIC && task.status === status
      ).length;
      const manualCount = tasks.filter(
        (task) =>
          task.originType !== TaskOriginType.AUTOMATIC && task.status === status
      ).length;

      const statusLabel = t(TASK_STATUS_TRANSLATION_MAP[status]);
      const autoLabel = `${t('oscrat.ui.dashboard.auto-generated')} — ${statusLabel}`;
      const manualLabel = `${t('oscrat.ui.dashboard.manual')} — ${statusLabel}`;
      const base = statusIdx * 2;

      return [
        {
          key: `auto-${status}`,
          label: autoLabel,
          count: autoCount,
          color: TASK_PIE_COLORS[base],
        },
        {
          key: `manual-${status}`,
          label: manualLabel,
          count: manualCount,
          color: TASK_PIE_COLORS[base + 1],
        },
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
      <div className="bg-surface border-line rounded-card border p-6">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-h6 text-content font-bold">
            {t('oscrat.ui.dashboard.overall-progress')}
          </h3>
          <span className="text-h4 text-primary font-bold">
            {overallProgress}%
          </span>
        </div>
        <div className="bg-surface-sunken h-4 w-full rounded-full">
          <div
            className="bg-primary h-4 rounded-full transition-all duration-300"
            style={{ width: `${overallProgress}%` }}
          />
        </div>
        <p className="text-c1 text-content-secondary mt-2">
          {requirementsStatus.filter((r) => r.isEvaluated).length} of{' '}
          {requirementsStatus.length}{' '}
          {t('oscrat.ui.dashboard.requirements-evaluated')}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Chart A: Evaluation Status */}
        <div className="bg-surface border-line rounded-card border p-6">
          <h3 className="text-h6 text-content mb-4 font-bold">
            {t('oscrat.ui.dashboard.evaluation-status')}
          </h3>
          <div className="flex h-64 items-center justify-center">
            <Pie
              data={{
                labels: chartData.evaluation.labels,
                datasets: [
                  {
                    data: chartData.evaluation.data,
                    backgroundColor: chartData.evaluation.colors,
                    borderWidth: 2,
                    borderColor: '#ffffff',
                  },
                ],
              }}
              options={PIE_OPTIONS}
            />
          </div>
        </div>

        {/* Chart A breakdown: Conformity Status (includes Not Evaluated + In Evaluation) */}
        <div className="bg-surface border-line rounded-card border p-6">
          <h3 className="text-h6 text-content mb-4 font-bold">
            {t('oscrat.ui.dashboard.conformity-breakdown')}
          </h3>
          <div className="flex h-64 items-center justify-center">
            <Pie
              data={{
                labels: chartData.conformity.labels,
                datasets: [
                  {
                    data: chartData.conformity.data,
                    backgroundColor: chartData.conformity.colors,
                    borderWidth: 2,
                    borderColor: '#ffffff',
                  },
                ],
              }}
              options={PIE_OPTIONS}
            />
          </div>
        </div>
      </div>

      {/* Chart B: Task Distribution */}
      {taskChartData && (
        <div className="bg-surface border-line rounded-card border p-6">
          <h3 className="text-h6 text-content mb-4 font-bold">
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
            <ul className="text-b2 text-content flex min-w-0 flex-1 flex-col gap-2">
              {taskChartData.legendRows.map((row) => (
                <li key={row.key} className="flex items-center gap-3">
                  <span
                    className="h-3 w-3 shrink-0 rounded"
                    style={{ backgroundColor: row.color }}
                    aria-hidden
                  />
                  <span className="min-w-0 flex-1 leading-snug">
                    {row.label}
                  </span>
                  <span className="text-content shrink-0 font-medium tabular-nums">
                    {row.count}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Status Table */}
      <div className="bg-surface border-line rounded-card overflow-hidden border">
        <div className="border-line-subtle border-b px-4 py-4">
          <h3 className="text-h6 text-content font-bold">
            {t('oscrat.ui.dashboard.requirements-status')}
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="divide-line-subtle min-w-full divide-y">
            <thead className="bg-surface-muted border-b border-line-header">
              <tr>
                <th className="text-content p-4 text-left text-b2 font-medium">
                  {t('oscrat.ui.dashboard.requirement-id')}
                </th>
                <th className="text-content p-4 text-left text-b2 font-medium">
                  {t('oscrat.ui.dashboard.requirement-name')}
                </th>
                <th className="text-content p-4 text-left text-b2 font-medium">
                  {t('oscrat.ui.dashboard.area')}
                </th>
                <th className="text-content p-4 text-left text-b2 font-medium">
                  {t('oscrat.ui.dashboard.evaluation-status')}
                </th>
                <th className="text-content p-4 text-left text-b2 font-medium">
                  {t('oscrat.ui.dashboard.conformity-status')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-surface divide-line-subtle divide-y">
              {requirementsStatus.map((req) => {
                const statusIcon =
                  req.conformityStatus === CONFORMITY_STATUS.FULLY_COMPLIANT ? (
                    <FaCheckCircle className="text-success" />
                  ) : req.conformityStatus.startsWith(
                      CONFORMITY_STATUS.IN_EVALUATION
                    ) ? (
                    <FaClock className="text-info" />
                  ) : req.conformityStatus ===
                    CONFORMITY_STATUS.NOT_COMPLIANT ? (
                    <FaExclamationCircle className="text-danger" />
                  ) : req.conformityStatus ===
                    CONFORMITY_STATUS.NOT_EVALUATED ? (
                    <FaExclamationCircle className="text-content-placeholder" />
                  ) : null;

                return (
                  <tr key={req.id} className="hover:bg-surface-muted">
                    <td className="text-b2 text-content whitespace-nowrap px-4 py-4 font-medium">
                      {req.id}
                    </td>
                    <td className="text-b2 text-content px-4 py-4">
                      {req.name}
                    </td>
                    <td className="text-b2 text-content-secondary px-4 py-4">
                      {req.areaName}
                    </td>
                    <td className="text-b2 whitespace-nowrap px-4 py-4">
                      <span
                        className={`text-c1 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-medium ${
                          req.isEvaluated
                            ? 'bg-success-subtle text-success-emphasis'
                            : 'bg-surface-muted text-content'
                        }`}
                      >
                        {req.isEvaluated
                          ? t('oscrat.ui.dashboard.evaluated')
                          : t('oscrat.ui.dashboard.not-evaluated')}
                      </span>
                    </td>
                    <td className="text-b2 whitespace-nowrap px-4 py-4">
                      <span
                        className={`text-c1 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-medium ${getStatusBadgeColor(req.conformityStatus)}`}
                      >
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
