import { withProductDetailLayout } from '@/lib/layout-helpers';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { useVersionContext } from '@/context/VersionContext';
import { useGetSbomReportDetail } from '@/lib/api/hooks/oscrat/jobs';
import { Loading, Breadcrumb } from '@/components/shared';
import Button from '@/components/button';
import { useOscratProject } from '@/hooks/oscrat/useOscratProject';
import { useOscratVersion } from '@/hooks/oscrat/useOscratVersion';
import usePagination from '@/hooks/usePagination';
import { FaDownload } from 'react-icons/fa';
import { useAttachments } from '@/hooks/useAttachments';
import toast from 'react-hot-toast';
import { extractErrorMessage } from '@/lib/utils';
import PaginationControls from '@/components/shared/PaginationControls';
import { tableStyles } from '@/components/oscrat/tableStyles';
import { reportStyles } from '@/components/oscrat/reportStyles';
import { WorkerJobStatus } from '@oscrat/model';
import ReportStatusMessage from '@/components/oscrat/ReportStatusMessage';
import { formatDateShort } from '@/utils/dateFormat';
import { LISTING_PAGE_SIZE } from '@/constants/pagination';

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

function SbomOverviewStats({
  overview,
  triggeredBy,
  t,
}: {
  overview: {
    totalComponents: number;
    scanDate: string;
    syftVersion: string;
  };
  triggeredBy: string;
  t: (key: string, options?: any) => string;
}) {
  return (
    <div className={reportStyles.card}>
      <h2 className={reportStyles.sectionTitle}>{t('oscrat.ui.overview')}</h2>
      <div className={reportStyles.metadataGrid4}>
        <div>
          <p className={reportStyles.metadataLabel}>
            {t('oscrat.ui.versions.sbom.total-components')}
          </p>
          <p className={reportStyles.metadataValueLarge}>
            {overview.totalComponents}
          </p>
        </div>
        <div>
          <p className={reportStyles.metadataLabel}>
            {t('oscrat.ui.scan-date')}
          </p>
          <p className={reportStyles.metadataValue}>
            {formatDateShort(overview.scanDate)}
          </p>
        </div>
        <div>
          <p className={reportStyles.metadataLabel}>
            {t('oscrat.ui.versions.sbom.syft-version')}
          </p>
          <p className={reportStyles.metadataValue}>{overview.syftVersion}</p>
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

function PackageTypesBreakdown({
  packageTypes,
  t,
}: {
  packageTypes: Record<string, number>;
  t: (key: string) => string;
}) {
  if (!packageTypes || Object.keys(packageTypes).length === 0) {
    return null;
  }

  return (
    <div className={reportStyles.card}>
      <h2 className={reportStyles.sectionTitle}>
        {t('oscrat.ui.versions.sbom.package-types')}
      </h2>
      <div className={reportStyles.typeGrid}>
        {Object.entries(packageTypes).map(([type, count]) => (
          <div key={type} className={reportStyles.typeCard}>
            <p className={reportStyles.metadataLabel}>{type}</p>
            <p className="text-content mt-1 text-xl font-semibold">{count}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function PackagesTable({
  packages,
  currentPage,
  totalPages,
  pageData,
  prevButtonDisabled,
  nextButtonDisabled,
  goToPreviousPage,
  goToNextPage,
  t,
}: {
  packages: any[];
  currentPage: number;
  totalPages: number;
  pageData: any[];
  prevButtonDisabled: boolean;
  nextButtonDisabled: boolean;
  goToPreviousPage: () => void;
  goToNextPage: () => void;
  t: (key: string, options?: any) => string;
}) {
  if (!packages || packages.length === 0) {
    return null;
  }

  return (
    <div className={reportStyles.tableCard}>
      <div className={reportStyles.tableHeader}>
        <h2 className="text-content text-lg font-medium">
          {t('oscrat.ui.versions.sbom.packages-section')}
        </h2>
        <p className={reportStyles.sectionSubtitle}>
          {t('oscrat.ui.versions.sbom.packages-found', {
            count: packages.length,
          })}
        </p>
      </div>
      <div className={tableStyles.wrapper}>
        <table className={tableStyles.table}>
          <thead className={tableStyles.thead}>
            <tr>
              <th className={tableStyles.th}>
                {t('oscrat.ui.versions.sbom.table-name')}
              </th>
              <th className={tableStyles.th}>
                {t('oscrat.ui.versions.sbom.table-version')}
              </th>
              <th className={tableStyles.th}>
                {t('oscrat.ui.versions.sbom.table-type')}
              </th>
            </tr>
          </thead>
          <tbody className={tableStyles.tbody}>
            {pageData.map((pkg: any, index: number) => (
              <tr key={index} className={tableStyles.tr}>
                <td className={`${tableStyles.td} text-content font-medium`}>
                  {pkg.name}
                </td>
                <td className={tableStyles.td}>{pkg.version || '-'}</td>
                <td className={tableStyles.td}>
                  <span
                    className={`${reportStyles.badge} bg-info-subtle text-info-emphasis`}
                  >
                    {pkg.type}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {packages.length > LISTING_PAGE_SIZE && (
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          prevButtonDisabled={prevButtonDisabled}
          nextButtonDisabled={nextButtonDisabled}
          goToPreviousPage={goToPreviousPage}
          goToNextPage={goToNextPage}
          showItemCount
          totalItems={packages.length}
          itemsPerPage={LISTING_PAGE_SIZE}
        />
      )}
    </div>
  );
}

export default function SbomSummary() {
  const { t } = useTranslation('common');
  const router = useRouter();
  const { reportId } = router.query;
  const { teamId, productId, versionId } = useVersionContext();

  const { project } = useOscratProject(teamId, productId);
  const { version: versionData } = useOscratVersion(
    teamId,
    productId,
    versionId
  );

  const { data: report, isLoading } = useGetSbomReportDetail(
    teamId,
    productId,
    versionId,
    reportId as string,
    { enabled: !!reportId }
  );

  const { downloadAttachment } = useAttachments(teamId);

  const sbomData = report?.sbomData as any;

  const {
    currentPage,
    totalPages,
    pageData,
    goToPreviousPage,
    goToNextPage,
    prevButtonDisabled,
    nextButtonDisabled,
  } = usePagination(sbomData?.packages || [], LISTING_PAGE_SIZE);

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
      href: `/organization/${teamId}/products/${productId}/versions/${versionId}?tab=sbom`,
    },
    {
      label: t('oscrat.ui.versions.sbom.title'),
      current: true,
    },
  ];

  if (isLoading) {
    return <Loading />;
  }

  // Handle not found and non-completed reports
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
          t('oscrat.ui.versions.sbom.failed-download-file')
        )
      );
    }
  };

  return (
    <>
      <Breadcrumb items={breadcrumbItems} />
      <div className={reportStyles.cardSection}>
        <ReportHeader
          title={t('oscrat.ui.versions.sbom.title')}
          downloadLabel={t('oscrat.ui.versions.sbom.download')}
          onDownload={handleDownload}
          hasAttachment={!!report.attachment}
        />

        {sbomData?.overview && (
          <SbomOverviewStats
            overview={sbomData.overview}
            triggeredBy={
              report.job.triggeredByUser?.name ||
              report.job.triggeredByUser?.email ||
              '-'
            }
            t={t}
          />
        )}

        <PackageTypesBreakdown packageTypes={sbomData?.packageTypes} t={t} />

        <PackagesTable
          packages={sbomData?.packages || []}
          currentPage={currentPage}
          totalPages={totalPages}
          pageData={pageData}
          prevButtonDisabled={prevButtonDisabled}
          nextButtonDisabled={nextButtonDisabled}
          goToPreviousPage={goToPreviousPage}
          goToNextPage={goToNextPage}
          t={t}
        />
      </div>
    </>
  );
}

SbomSummary.getLayout = withProductDetailLayout;

export { getCommonServerSideProps as getServerSideProps } from '@/lib/server-helpers';
