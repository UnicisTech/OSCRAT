import React from 'react';
import { FaEye, FaTrash } from 'react-icons/fa';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import type { OscratIncidentSummary } from '@oscrat/model';
import { IncidentStatus } from '@oscrat/model';
import usePagination from '@/hooks/usePagination';
import ActionButton from '@/components/oscrat/ActionButton';
import { tableStyles } from '@/components/oscrat/tableStyles';
import PaginationControls from '@/components/shared/PaginationControls';
import normalizeText from '@/utils/normalizeText';
import { formatDateShort } from '@/utils/dateFormat';

const ITEMS_PER_PAGE = 15;

interface IncidentsTableProps {
  incidents?: OscratIncidentSummary[];
  onDelete: (incidentId: string) => void;
  itemsPerPage?: number;
}

const Table: React.FC<IncidentsTableProps> = ({
  incidents,
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
  } = usePagination<OscratIncidentSummary>(incidents || [], pageSize);

  if (!ready) {
    return null;
  }

  const getStatusBadge = (status: IncidentStatus) => {
    const statusConfig: Record<
      IncidentStatus,
      { bgColor: string; textColor: string }
    > = {
      [IncidentStatus.PENDING]: { bgColor: 'bg-gray-100', textColor: 'text-gray-800' },
      [IncidentStatus.START]: { bgColor: 'bg-blue-100', textColor: 'text-blue-800' },
      [IncidentStatus.DECLARED]: { bgColor: 'bg-yellow-100', textColor: 'text-yellow-800' },
      [IncidentStatus.STABLE]: { bgColor: 'bg-cyan-100', textColor: 'text-cyan-800' },
      [IncidentStatus.ACTIVE]: { bgColor: 'bg-orange-100', textColor: 'text-orange-800' },
      [IncidentStatus.RESOLVED]: { bgColor: 'bg-green-100', textColor: 'text-green-800' },
      [IncidentStatus.COMPLETED]: { bgColor: 'bg-emerald-100', textColor: 'text-emerald-800' },
    };

    const config = statusConfig[status] || statusConfig[IncidentStatus.PENDING];

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

  const handleViewDetails = (incidentId: string) => {
    router.push(
      `/teams/${slug}/products/${productId}/versions/${versionId}/incidents/${incidentId}`
    );
  };

  return (
    <div className="w-full">
      <div className={tableStyles.wrapper}>
        <table className="w-full text-left text-sm text-gray-600">
          <thead className={tableStyles.thead}>
            <tr>
              <th className={tableStyles.th}>
                {t('oscrat.ui.versions.incidents.table-status')}
              </th>
              <th className={tableStyles.th}>
                {t('oscrat.ui.versions.incidents.table-classification')}
              </th>
              <th className={tableStyles.th}>
                {t('oscrat.ui.versions.incidents.table-attack-type')}
              </th>
              <th className={tableStyles.th}>
                {t('oscrat.ui.versions.incidents.table-severity')}
              </th>
              <th className={tableStyles.th}>
                {t('oscrat.ui.versions.incidents.table-date-detected')}
              </th>
              <th className={tableStyles.th}>
                {t('oscrat.ui.versions.incidents.table-reporter')}
              </th>
              <th className={tableStyles.th}>
                {t('oscrat.ui.versions.incidents.table-description')}
              </th>
              <th className={tableStyles.th}>
                {t('actions')}
              </th>
            </tr>
          </thead>
          <tbody className={tableStyles.tbody}>
            {pageData.map((incident) => (
              <tr key={incident.id} className={tableStyles.tr}>
                <td className={tableStyles.td}>
                  {getStatusBadge(incident.status)}
                </td>
                <td className={tableStyles.td}>
                  <div className="max-w-[150px] truncate" title={normalizeText(incident.classification)}>
                    {normalizeText(incident.classification)}
                  </div>
                </td>
                <td className={tableStyles.td}>
                  <div className="max-w-[150px] truncate" title={normalizeText(incident.attackType)}>
                    {normalizeText(incident.attackType)}
                  </div>
                </td>
                <td className={tableStyles.td}>
                  {getSeverityBadge(incident.severity)}
                </td>
                <td className={tableStyles.td}>
                  {formatDateShort(incident.dateOfDetection)}
                </td>
                <td className={tableStyles.td}>
                  <div className="max-w-[150px] truncate" title={incident.reporter.name}>
                    {incident.reporter.name}
                  </div>
                </td>
                <td className={tableStyles.td}>
                  <div className="max-w-[250px] truncate" title={incident.description}>
                    {incident.description}
                  </div>
                </td>
                <td className={tableStyles.td}>
                  <div className="flex items-center gap-2">
                    <ActionButton
                      onClick={() => handleViewDetails(incident.id)}
                      icon={<FaEye size={12} />}
                      title={t('oscrat.ui.versions.incidents.view-details')}
                    >
                      {t('oscrat.ui.view')}
                    </ActionButton>
                    <ActionButton
                      onClick={() => onDelete(incident.id)}
                      icon={<FaTrash size={12} />}
                      title={t('oscrat.ui.versions.incidents.delete-incident')}
                    >
                      {t('oscrat.ui.delete')}
                    </ActionButton>
                  </div>
                </td>
              </tr>
            ))}
            {(!incidents || incidents.length === 0) && (
              <tr>
                <td
                  colSpan={8}
                  className="px-6 py-8 text-center text-sm text-gray-500"
                >
                  {t('oscrat.ui.versions.incidents.no-incidents-added')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {incidents && incidents.length > pageSize && (
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

