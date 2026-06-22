import React, { useMemo } from 'react';
import { FaTrash, FaEye } from 'react-icons/fa';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import type { OscratVulnerabilitySummary } from '@oscrat/model';
import { OscratProductVulnerabilityStatus } from '@oscrat/model';
import usePagination from '@/hooks/usePagination';
import ActionButton from '@/components/oscrat/ActionButton';
import { tableStyles } from '@/components/oscrat/tableStyles';
import PaginationControls from '@/components/shared/PaginationControls';
import normalizeText from '@/utils/normalizeText';
import { formatDateShort } from '@/utils/dateFormat';
import { sortByCreatedAtDesc } from '@/utils/sortItems';
import SeverityBadge from '@/components/oscrat/shared/SeverityBadge';
import {
  TableWrapper,
  TableHeader,
  TableRow,
} from '@/components/oscrat/versions/versionDetails/tabs/allTabs/shared';
import { LISTING_PAGE_SIZE } from '@/constants/pagination';

interface VulnerabilitiesTableProps {
  vulnerabilities?: OscratVulnerabilitySummary[];
  onDelete: (vulnerabilityId: string) => void;
  itemsPerPage?: number;
}

const Table: React.FC<VulnerabilitiesTableProps> = ({
  vulnerabilities,
  onDelete,
  itemsPerPage,
}) => {
  const { t, ready } = useTranslation('common');
  const router = useRouter();
  const { slug, productId, versionId } = router.query;

  const pageSize = itemsPerPage || LISTING_PAGE_SIZE;
  const sortedVulnerabilities = useMemo(
    () => sortByCreatedAtDesc(vulnerabilities),
    [vulnerabilities]
  );
  const {
    currentPage,
    totalPages,
    pageData,
    goToPreviousPage,
    goToNextPage,
    prevButtonDisabled,
    nextButtonDisabled,
  } = usePagination<OscratVulnerabilitySummary>(
    sortedVulnerabilities,
    pageSize
  );

  if (!ready) {
    return null;
  }

  const getStatusBadge = (status: OscratProductVulnerabilityStatus) => {
    const statusConfig: Record<
      OscratProductVulnerabilityStatus,
      { bgColor: string; textColor: string }
    > = {
      [OscratProductVulnerabilityStatus.PENDING]: {
        bgColor: 'bg-surface-muted',
        textColor: 'text-content',
      },
      [OscratProductVulnerabilityStatus.PREPARATION]: {
        bgColor: 'bg-info-subtle',
        textColor: 'text-info-emphasis',
      },
      [OscratProductVulnerabilityStatus.RECEIPT]: {
        bgColor: 'bg-info-subtle',
        textColor: 'text-info-emphasis',
      },
      [OscratProductVulnerabilityStatus.VERIFICATION]: {
        bgColor: 'bg-warning-subtle',
        textColor: 'text-warning-emphasis',
      },
      [OscratProductVulnerabilityStatus.REMEDIATION_DEVELOPMENT]: {
        bgColor: 'bg-warning-subtle',
        textColor: 'text-warning-emphasis',
      },
      [OscratProductVulnerabilityStatus.RELEASE]: {
        bgColor: 'bg-success-subtle',
        textColor: 'text-success-emphasis',
      },
      [OscratProductVulnerabilityStatus.POST_RELEASE]: {
        bgColor: 'bg-success-subtle',
        textColor: 'text-success-emphasis',
      },
    };

    const config =
      statusConfig[status] ||
      statusConfig[OscratProductVulnerabilityStatus.PENDING];

    return (
      <span
        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${config.bgColor} ${config.textColor}`}
      >
        {normalizeText(status)}
      </span>
    );
  };

  const handleViewDetails = (vulnerabilityId: string) => {
    router.push(
      `/organization/${slug}/products/${productId}/versions/${versionId}/vulnerabilities/${vulnerabilityId}`
    );
  };

  return (
    <div className="w-full">
      <TableWrapper>
        <table className="text-content-secondary w-full text-left text-sm">
          <TableHeader
            columns={[
              { label: t('oscrat.ui.versions.vulnerabilities.table-name') },
              { label: t('oscrat.ui.versions.vulnerabilities.table-status') },
              { label: t('oscrat.ui.versions.vulnerabilities.table-severity') },
              {
                label: t(
                  'oscrat.ui.versions.vulnerabilities.table-date-of-discovery'
                ),
              },
              {
                label: t(
                  'oscrat.ui.versions.vulnerabilities.table-description'
                ),
              },
              { label: t('actions'), srOnly: true },
            ]}
          />
          <tbody className={tableStyles.tbody}>
            {pageData.map((vulnerability) => (
              <TableRow
                key={vulnerability.id}
                className="cursor-pointer"
                onClick={() => handleViewDetails(vulnerability.id)}
              >
                <td className={tableStyles.td}>
                  <div
                    className="max-w-[200px] truncate"
                    title={vulnerability.name}
                  >
                    {vulnerability.name}
                  </div>
                </td>
                <td className={tableStyles.td}>
                  {getStatusBadge(vulnerability.status)}
                </td>
                <td className={tableStyles.td}>
                  <SeverityBadge
                    severity={vulnerability.severity}
                    label={normalizeText(vulnerability.severity)}
                  />
                </td>
                <td className={tableStyles.td}>
                  {formatDateShort(vulnerability.dateOfDiscovery)}
                </td>
                <td className={tableStyles.td}>
                  <div
                    className="max-w-[300px] truncate"
                    title={vulnerability.description}
                  >
                    {vulnerability.description}
                  </div>
                </td>
                <td className={tableStyles.td}>
                  <div
                    className="flex items-center gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ActionButton
                      onClick={() => onDelete(vulnerability.id)}
                      icon={<FaTrash size={12} />}
                      title={t(
                        'oscrat.ui.versions.vulnerabilities.delete-vulnerability'
                      )}
                    >
                      {t('oscrat.ui.delete')}
                    </ActionButton>
                    <ActionButton
                      onClick={() => handleViewDetails(vulnerability.id)}
                      icon={<FaEye size={12} />}
                      title={t('view')}
                    >
                      {t('view')}
                    </ActionButton>
                  </div>
                </td>
              </TableRow>
            ))}
            {!sortedVulnerabilities.length && (
              <tr>
                <td
                  colSpan={6}
                  className="text-content-muted px-6 py-8 text-center text-sm"
                >
                  {t(
                    'oscrat.ui.versions.vulnerabilities.no-vulnerabilities-added'
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </TableWrapper>

      {sortedVulnerabilities.length > pageSize && (
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
};

export default Table;
