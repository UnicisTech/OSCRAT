import { withProductDetailLayout } from '@/lib/layout-helpers';
import { useRouter } from 'next/router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'next-i18next';
import { useVersionContext } from '@/context/VersionContext';
import { useTeamContext } from '@/context/TeamContext';
import { useGetConfigurationScanReportDetail } from '@/lib/api/hooks/oscrat/jobs';
import { Loading, Breadcrumb } from '@/components/shared';
import Button from '@/components/button';
import { useOscratProject } from '@/hooks/oscrat/useOscratProject';
import { useOscratVersion } from '@/hooks/oscrat/useOscratVersion';
import usePagination from '@/hooks/usePagination';
import { FaDownload, FaPlus, FaEye } from 'react-icons/fa';
import { useAttachments } from '@/hooks/useAttachments';
import toast from 'react-hot-toast';
import { extractErrorMessage } from '@/lib/utils';
import PaginationControls from '@/components/shared/PaginationControls';
import ActionButton from '@/components/oscrat/ActionButton';
import { CreateTask } from '@/components/interfaces/Task';
import { tableStyles } from '@/components/oscrat/tableStyles';
import { reportStyles } from '@/components/oscrat/reportStyles';
import {
  ConfigurationScanFormat,
  WorkerJobStatus,
  CONFIGURATION_RESULT,
  CONFIGURATION_SEVERITY,
  TaskOriginType,
  sortConfigurationScanRules,
  TASK_CONFIGURATION_PROPERTY_KEYS,
} from '@oscrat/model';
import type {
  ConfigurationScanSummary,
  ConfigurationScanRuleResult,
  ConfigurationResult,
  ConfigurationSeverity,
} from '@oscrat/model';
import type { TaskConfigurationProperties } from '@/types';
import ReportStatusMessage from '@/components/oscrat/ReportStatusMessage';
import {
  sanitizeForTitle,
  sanitizeForDescription,
  truncateAtWordBoundary,
} from '@/lib/text-sanitize';
import { formatDateShort } from '@/utils/dateFormat';

const TASK_TITLE_MAX = 100;
const TASK_DESCRIPTION_MAX = 500;

const ITEMS_PER_PAGE = 15;

const SEVERITY_BADGE: Record<ConfigurationSeverity, string> = {
  [CONFIGURATION_SEVERITY.HIGH]: 'border border-danger text-content',
  [CONFIGURATION_SEVERITY.MEDIUM]: 'border border-caution text-content',
  [CONFIGURATION_SEVERITY.LOW]: 'border border-info text-content',
  [CONFIGURATION_SEVERITY.UNKNOWN]: 'border border-content-muted text-content',
};

const RESULT_BADGE: Record<ConfigurationResult, string> = {
  [CONFIGURATION_RESULT.PASS]: 'bg-success-subtle text-success-emphasis',
  [CONFIGURATION_RESULT.FAIL]: 'bg-danger-subtle text-danger-emphasis',
  [CONFIGURATION_RESULT.ERROR]: 'bg-danger-subtle text-danger-emphasis',
  [CONFIGURATION_RESULT.NOT_APPLICABLE]: 'bg-surface-muted text-content',
  [CONFIGURATION_RESULT.NOT_CHECKED]: 'bg-surface-muted text-content',
  [CONFIGURATION_RESULT.NOT_SELECTED]: 'bg-surface-muted text-content',
  [CONFIGURATION_RESULT.INFORMATIONAL]: 'bg-info-subtle text-info-emphasis',
  [CONFIGURATION_RESULT.FIXED]: 'bg-success-subtle text-success-emphasis',
};

function ReportHeader({
  title,
  downloadLabel,
  onDownload,
  hasAttachment,
}: {
  title: string;
  downloadLabel: string;
  onDownload: () => void;
  hasAttachment: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <h1 className={reportStyles.pageTitle}>{title}</h1>
      <Button
        variant="secondary"
        size="m"
        onClick={onDownload}
        disabled={!hasAttachment}
        startIcon={<FaDownload size={14} />}
      >
        {downloadLabel}
      </Button>
    </div>
  );
}

function OverviewStats({
  summary,
  format,
  formatVersion,
  triggeredBy,
  t,
}: {
  summary: ConfigurationScanSummary;
  format: ConfigurationScanFormat;
  formatVersion: string;
  triggeredBy: string;
  t: (key: string, options?: any) => string;
}) {
  return (
    <div className={reportStyles.card}>
      <h2 className={reportStyles.sectionTitle}>{t('oscrat.ui.overview')}</h2>
      <div className={reportStyles.metadataGrid4}>
        <div>
          <p className={reportStyles.metadataLabel}>
            {t('oscrat.ui.versions.configuration.total-rules')}
          </p>
          <p className={reportStyles.metadataValueLarge}>
            {summary.totalRules}
          </p>
        </div>
        <div>
          <p className={reportStyles.metadataLabel}>
            {t('oscrat.ui.versions.configuration.pass-count')}
          </p>
          <p className={reportStyles.metadataValueLarge}>{summary.passCount}</p>
        </div>
        <div>
          <p className={reportStyles.metadataLabel}>
            {t('oscrat.ui.versions.configuration.fail-count')}
          </p>
          <p className={reportStyles.metadataValueLarge}>{summary.failCount}</p>
        </div>
        <div>
          <p className={reportStyles.metadataLabel}>
            {t('oscrat.ui.versions.configuration.error-count')}
          </p>
          <p className={reportStyles.metadataValueLarge}>
            {summary.errorCount}
          </p>
        </div>
        <div>
          <p className={reportStyles.metadataLabel}>
            {t('oscrat.ui.versions.configuration.not-applicable-count')}
          </p>
          <p className={reportStyles.metadataValue}>
            {summary.notApplicableCount}
          </p>
        </div>
        <div>
          <p className={reportStyles.metadataLabel}>
            {t('oscrat.ui.versions.configuration.scan-date')}
          </p>
          <p className={reportStyles.metadataValue}>
            {formatDateShort(summary.scanDate)}
          </p>
        </div>
        <div>
          <p className={reportStyles.metadataLabel}>
            {t('oscrat.ui.versions.configuration.format')}
          </p>
          <p className={reportStyles.metadataValue}>
            {format} {formatVersion}
          </p>
        </div>
        <div>
          <p className={reportStyles.metadataLabel}>
            {t('oscrat.ui.triggered-by-label')}
          </p>
          <p className={reportStyles.metadataValue}>{triggeredBy}</p>
        </div>
      </div>
    </div>
  );
}

function BenchmarkInfo({
  summary,
  t,
}: {
  summary: ConfigurationScanSummary;
  t: (key: string) => string;
}) {
  const hasBenchmark =
    summary.benchmarkId || summary.profileId || summary.targetHostname;

  if (!hasBenchmark) {
    return null;
  }

  return (
    <div className={reportStyles.card}>
      <h2 className={reportStyles.sectionTitle}>
        {t('oscrat.ui.versions.configuration.benchmark')}
      </h2>
      <div className={reportStyles.metadataGrid4}>
        {summary.benchmarkId && (
          <div>
            <p className={reportStyles.metadataLabel}>
              {t('oscrat.ui.versions.configuration.benchmark')}
            </p>
            <p className={reportStyles.metadataValue}>
              {summary.benchmarkId}
              {summary.benchmarkVersion ? ` (${summary.benchmarkVersion})` : ''}
            </p>
          </div>
        )}
        {summary.profileId && (
          <div>
            <p className={reportStyles.metadataLabel}>
              {t('oscrat.ui.versions.configuration.profile')}
            </p>
            <p className={reportStyles.metadataValue}>
              {summary.profileTitle || summary.profileId}
            </p>
          </div>
        )}
        {summary.targetHostname && (
          <div>
            <p className={reportStyles.metadataLabel}>
              {t('oscrat.ui.versions.configuration.target-hostname')}
            </p>
            <p className={reportStyles.metadataValue}>
              {summary.targetHostname}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function RulesTable({
  rules,
  currentPage,
  totalPages,
  pageData,
  prevButtonDisabled,
  nextButtonDisabled,
  goToPreviousPage,
  goToNextPage,
  onCreateTask,
  onViewTask,
  t,
}: {
  rules: ConfigurationScanRuleResult[];
  currentPage: number;
  totalPages: number;
  pageData: ConfigurationScanRuleResult[];
  prevButtonDisabled: boolean;
  nextButtonDisabled: boolean;
  goToPreviousPage: () => void;
  goToNextPage: () => void;
  onCreateTask: (rule: ConfigurationScanRuleResult) => void;
  onViewTask: (taskNumber: number) => void;
  t: (key: string, options?: any) => string;
}) {
  if (!rules || rules.length === 0) {
    return null;
  }

  return (
    <div className={reportStyles.tableCard}>
      <div className={reportStyles.tableHeader}>
        <h2 className="text-content text-lg font-medium">
          {t('oscrat.ui.versions.configuration.rules-section')}
        </h2>
        <p className={reportStyles.sectionSubtitle}>
          {t('oscrat.ui.versions.configuration.rules-found', {
            count: rules.length,
          })}
        </p>
      </div>
      <div className={tableStyles.wrapper}>
        <table className={tableStyles.table}>
          <thead className={tableStyles.thead}>
            <tr>
              <th className={tableStyles.th}>
                {t('oscrat.ui.versions.configuration.table-rule-id')}
              </th>
              <th className={tableStyles.th}>
                {t('oscrat.ui.versions.configuration.table-title')}
              </th>
              <th className={tableStyles.th}>
                {t('oscrat.ui.versions.configuration.table-severity')}
              </th>
              <th className={tableStyles.th}>
                {t('oscrat.ui.versions.configuration.table-result')}
              </th>
              <th className={tableStyles.th}>
                {t('oscrat.ui.versions.configuration.table-action')}
              </th>
            </tr>
          </thead>
          <tbody className={tableStyles.tbody}>
            {pageData.map((rule, index) => (
              <tr key={`${rule.ruleId}-${index}`} className={tableStyles.tr}>
                <td
                  className={`${tableStyles.td} text-content-secondary font-mono text-xs`}
                >
                  {rule.ruleId}
                </td>
                <td className={`${tableStyles.td} text-content font-medium`}>
                  {rule.title}
                </td>
                <td className={tableStyles.td}>
                  <span
                    className={`${reportStyles.badge} ${SEVERITY_BADGE[rule.severity]}`}
                  >
                    {rule.severity}
                  </span>
                </td>
                <td className={tableStyles.td}>
                  <span
                    className={`${reportStyles.badge} ${RESULT_BADGE[rule.result]}`}
                  >
                    {rule.result}
                  </span>
                </td>
                <td className={tableStyles.td}>
                  {rule.existingTask ? (
                    <ActionButton
                      onClick={() => onViewTask(rule.existingTask!.taskNumber)}
                      icon={<FaEye size={12} />}
                      title={t('oscrat.ui.view-task')}
                    >
                      {t('oscrat.ui.view-task')}
                    </ActionButton>
                  ) : rule.result === CONFIGURATION_RESULT.FAIL ? (
                    <ActionButton
                      onClick={() => onCreateTask(rule)}
                      icon={<FaPlus size={12} />}
                      title={t('oscrat.ui.versions.configuration.create-task')}
                    >
                      {t('oscrat.ui.versions.configuration.create-task')}
                    </ActionButton>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {rules.length > ITEMS_PER_PAGE && (
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          prevButtonDisabled={prevButtonDisabled}
          nextButtonDisabled={nextButtonDisabled}
          goToPreviousPage={goToPreviousPage}
          goToNextPage={goToNextPage}
        />
      )}
    </div>
  );
}

export default function ConfigurationScanSummaryPage() {
  const { t } = useTranslation('common');
  const router = useRouter();
  const { reportId } = router.query;
  const { teamId, productId, versionId } = useVersionContext();
  const { teamContext } = useTeamContext();

  const { project } = useOscratProject(teamId, productId);
  const { version: versionData } = useOscratVersion(
    teamId,
    productId,
    versionId
  );

  const { data: report, isLoading } = useGetConfigurationScanReportDetail(
    teamId,
    productId,
    versionId,
    reportId as string,
    { enabled: !!reportId }
  );

  const { downloadAttachment } = useAttachments();

  const summary = report?.scanData ?? null;
  const sortedRules = useMemo(
    () => (summary?.rules ? sortConfigurationScanRules(summary.rules) : []),
    [summary?.rules]
  );

  const [taskModalVisible, setTaskModalVisible] = useState(false);
  const [selectedRule, setSelectedRule] =
    useState<ConfigurationScanRuleResult | null>(null);

  const {
    currentPage,
    totalPages,
    pageData,
    goToPreviousPage,
    goToNextPage,
    prevButtonDisabled,
    nextButtonDisabled,
  } = usePagination(sortedRules, ITEMS_PER_PAGE);

  const breadcrumbItems = [
    {
      label: t('oscrat.ui.products'),
      href: `/organization/${teamId}/products`,
    },
    {
      label: project?.name || '',
      href: `/organization/${teamId}/products/${productId}`,
    },
    {
      label: versionData?.version || '',
      href: `/organization/${teamId}/products/${productId}/versions/${versionId}?tab=configuration`,
    },
    {
      label: t('oscrat.ui.versions.configuration.title'),
      current: true,
    },
  ];

  if (isLoading) {
    return <Loading />;
  }

  if (!report || report.status !== WorkerJobStatus.COMPLETED) {
    return <ReportStatusMessage status={report?.status} />;
  }

  const handleDownload = async () => {
    if (!report.attachment) return;

    try {
      await downloadAttachment(report.attachment.id, report.attachment.name);
      toast.success(t('oscrat.ui.download-starting'));
    } catch (error: unknown) {
      toast.error(
        extractErrorMessage(
          error,
          t('oscrat.ui.versions.configuration.failed-download-file')
        )
      );
    }
  };

  const handleCreateTask = (rule: ConfigurationScanRuleResult) => {
    setSelectedRule(rule);
    setTaskModalVisible(true);
  };

  const taskTitle = selectedRule
    ? buildTaskTitle(
        selectedRule,
        t('oscrat.ui.versions.configuration.task-title-prefix')
      )
    : '';

  const taskDescription = selectedRule
    ? buildTaskDescription(selectedRule, t)
    : '';

  const linkedProperties: Partial<TaskConfigurationProperties> | undefined =
    selectedRule
      ? {
          [TASK_CONFIGURATION_PROPERTY_KEYS.REPORT_ID]: reportId as string,
          [TASK_CONFIGURATION_PROPERTY_KEYS.RULE_ID]: selectedRule.ruleId,
          ...(selectedRule.cceId
            ? { [TASK_CONFIGURATION_PROPERTY_KEYS.CCE]: selectedRule.cceId }
            : {}),
          [TASK_CONFIGURATION_PROPERTY_KEYS.SEVERITY]: selectedRule.severity,
        }
      : undefined;

  const handleViewTask = (taskNumber: number) => {
    router.push(`/organization/${teamId}/tasks/${taskNumber}`);
  };

  return (
    <>
      <Breadcrumb items={breadcrumbItems} />
      <div className={reportStyles.cardSection}>
        <ReportHeader
          title={t('oscrat.ui.versions.configuration.title')}
          downloadLabel={t('oscrat.ui.versions.configuration.download')}
          onDownload={handleDownload}
          hasAttachment={!!report.attachment}
        />

        {summary && (
          <>
            <OverviewStats
              summary={summary}
              format={report.format}
              formatVersion={report.formatVersion}
              triggeredBy={
                report.job.triggeredByUser?.name ||
                report.job.triggeredByUser?.email ||
                '-'
              }
              t={t}
            />
            <BenchmarkInfo summary={summary} t={t} />
            <RulesTable
              rules={sortedRules}
              currentPage={currentPage}
              totalPages={totalPages}
              pageData={pageData}
              prevButtonDisabled={prevButtonDisabled}
              nextButtonDisabled={nextButtonDisabled}
              goToPreviousPage={goToPreviousPage}
              goToNextPage={goToNextPage}
              onCreateTask={handleCreateTask}
              onViewTask={handleViewTask}
              t={t}
            />
          </>
        )}
      </div>

      {teamContext.team && (
        <CreateTask
          visible={taskModalVisible}
          setVisible={(v) => {
            setTaskModalVisible(v);
            if (!v) setSelectedRule(null);
          }}
          team={teamContext.team}
          defaultProductId={productId}
          defaultVersionId={versionId}
          defaultTitle={taskTitle}
          defaultDescription={taskDescription}
          defaultOriginType={TaskOriginType.AUTOMATIC}
          linkedProperties={linkedProperties}
        />
      )}
    </>
  );
}

function buildTaskTitle(
  rule: ConfigurationScanRuleResult,
  prefix: string
): string {
  const candidates = [rule.title, rule.cceId, rule.ruleId?.split('_').pop()];
  const sanitizedPrefix = sanitizeForTitle(prefix);
  // ' - ' (hyphen) instead of ': ' because ':' is not in the title char regex.
  const head = sanitizedPrefix ? `${sanitizedPrefix} - ` : '';
  const budget = TASK_TITLE_MAX - head.length;

  for (const candidate of candidates) {
    const sanitized = sanitizeForTitle(candidate);
    if (sanitized) {
      return `${head}${truncateAtWordBoundary(sanitized, budget)}`;
    }
  }
  return truncateAtWordBoundary(sanitizedPrefix, TASK_TITLE_MAX);
}

function buildTaskDescription(
  rule: ConfigurationScanRuleResult,
  t: (key: string, options?: any) => string
): string {
  const headerLines: string[] = [
    t('oscrat.ui.versions.configuration.task-description-header'),
  ];
  if (rule.cceId) {
    headerLines.push(
      `${t('oscrat.ui.versions.configuration.task-description-cce')}: ${rule.cceId}`
    );
  }
  headerLines.push(
    `${t('oscrat.ui.versions.configuration.task-description-rule-id')}: ${rule.ruleId}`
  );
  headerLines.push(
    `${t('oscrat.ui.versions.configuration.task-description-severity')}: ${formatSeverity(rule.severity)}`
  );
  const header = sanitizeForDescription(headerLines.join('\n'));

  if (header.length >= TASK_DESCRIPTION_MAX) {
    return truncateAtWordBoundary(header, TASK_DESCRIPTION_MAX);
  }

  const bodySource = rule.description?.trim() ? rule.description : rule.title;
  const sanitizedBody = sanitizeForDescription(bodySource);
  if (!sanitizedBody) {
    return header;
  }

  const separator = '\n\n';
  const bodyBudget = TASK_DESCRIPTION_MAX - header.length - separator.length;
  if (bodyBudget <= 0) {
    return header;
  }
  const body = truncateAtWordBoundary(sanitizedBody, bodyBudget);
  return `${header}${separator}${body}`;
}

function formatSeverity(severity: ConfigurationSeverity): string {
  return severity.charAt(0).toUpperCase() + severity.slice(1);
}

ConfigurationScanSummaryPage.getLayout = withProductDetailLayout;

export { getCommonServerSideProps as getServerSideProps } from '@/lib/server-helpers';
