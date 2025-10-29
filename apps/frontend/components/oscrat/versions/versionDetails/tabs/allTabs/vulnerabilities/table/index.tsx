import React from 'react';
import { FaTrash } from 'react-icons/fa';
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

const ITEMS_PER_PAGE = 15;

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

  const pageSize = itemsPerPage || ITEMS_PER_PAGE;
  const {
    currentPage,
    totalPages,
    pageData,
    goToPreviousPage,
    goToNextPage,
    prevButtonDisabled,
    nextButtonDisabled,
  } = usePagination<OscratVulnerabilitySummary>(vulnerabilities || [], pageSize);

  if (!ready) {
    return null;
  }

  const getStatusBadge = (status: OscratProductVulnerabilityStatus) => {
    const statusConfig: Record<
      OscratProductVulnerabilityStatus,
      { bgColor: string; textColor: string }
    > = {
      [OscratProductVulnerabilityStatus.PENDING]: { bgColor: 'bg-gray-100', textColor: 'text-gray-800' },
      [OscratProductVulnerabilityStatus.PREPARATION]: { bgColor: 'bg-blue-100', textColor: 'text-blue-800' },
      [OscratProductVulnerabilityStatus.RECEIPT]: { bgColor: 'bg-cyan-100', textColor: 'text-cyan-800' },
      [OscratProductVulnerabilityStatus.VERIFICATION]: { bgColor: 'bg-yellow-100', textColor: 'text-yellow-800' },
      [OscratProductVulnerabilityStatus.REMEDIATION_DEVELOPMENT]: { bgColor: 'bg-orange-100', textColor: 'text-orange-800' },
      [OscratProductVulnerabilityStatus.RELEASE]: { bgColor: 'bg-green-100', textColor: 'text-green-800' },
      [OscratProductVulnerabilityStatus.POST_RELEASE]: { bgColor: 'bg-emerald-100', textColor: 'text-emerald-800' },
    };

    const config = statusConfig[status] || statusConfig[OscratProductVulnerabilityStatus.PENDING];

    return (
      <span
        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${config.bgColor} ${config.textColor}`}
      >
        {normalizeText(status)}
      </span>
    );
  };

  const getSeverityBadge = (severity: string) => {
    const severityConfig: Record<
      string,
      { bgColor: string; textColor: string }
    > = {
      LOW: { bgColor: 'bg-blue-100', textColor: 'text-blue-800' },
      MEDIUM: { bgColor: 'bg-yellow-100', textColor: 'text-yellow-800' },
      HIGH: { bgColor: 'bg-orange-100', textColor: 'text-orange-800' },
      CRITICAL: { bgColor: 'bg-red-100', textColor: 'text-red-800' },
    };

    const config = severityConfig[severity] || severityConfig.LOW;

    return (
      <span
        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${config.bgColor} ${config.textColor}`}
      >
        {normalizeText(severity)}
      </span>
    );
  };

  const handleViewDetails = (vulnerabilityId: string) => {
    router.push(
      `/teams/${slug}/products/${productId}/versions/${versionId}/vulnerabilities/${vulnerabilityId}`
    );
  };

  return (
    <div className="w-full">
      <div className={tableStyles.wrapper}>
        <table className="w-full text-left text-sm text-gray-600">
          <thead className={tableStyles.thead}>
            <tr>
              <th className={tableStyles.th}>
                {t('oscrat.ui.versions.vulnerabilities.table-name')}
              </th>
              <th className={tableStyles.th}>
                {t('oscrat.ui.versions.vulnerabilities.table-status')}
              </th>
              <th className={tableStyles.th}>
                {t('oscrat.ui.versions.vulnerabilities.table-severity')}
              </th>
              <th className={tableStyles.th}>
                {t('oscrat.ui.versions.vulnerabilities.table-date-of-discovery')}
              </th>
              <th className={tableStyles.th}>
                {t('oscrat.ui.versions.vulnerabilities.table-description')}
              </th>
              <th className={tableStyles.th}>
                {t('actions')}
              </th>
            </tr>
          </thead>
          <tbody className={tableStyles.tbody}>
            {pageData.map((vulnerability) => (
              <tr
                key={vulnerability.id}
                className={`${tableStyles.tr} cursor-pointer`}
                onClick={() => handleViewDetails(vulnerability.id)}
              >
                <td className={tableStyles.td}>
                  <div className="max-w-[200px] truncate" title={vulnerability.name}>
                    {vulnerability.name}
                  </div>
                </td>
                <td className={tableStyles.td}>
                  {getStatusBadge(vulnerability.status)}
                </td>
                <td className={tableStyles.td}>
                  {getSeverityBadge(vulnerability.severity)}
                </td>
                <td className={tableStyles.td}>
                  {formatDateShort(vulnerability.dateOfDiscovery)}
                </td>
                <td className={tableStyles.td}>
                  <div className="max-w-[300px] truncate" title={vulnerability.description}>
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
                      title={t('oscrat.ui.versions.vulnerabilities.delete-vulnerability')}
                    >
                      {t('oscrat.ui.delete')}
                    </ActionButton>
                  </div>
                </td>
              </tr>
            ))}
            {(!vulnerabilities || vulnerabilities.length === 0) && (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-8 text-center text-sm text-gray-500"
                >
                  {t('oscrat.ui.versions.vulnerabilities.no-vulnerabilities-added')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {vulnerabilities && vulnerabilities.length > pageSize && (
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
