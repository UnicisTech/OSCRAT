import React, { useMemo } from 'react';
import { FaTrash, FaEye } from 'react-icons/fa';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import type { OscratIncidentSummary } from '@oscrat/model';
import { IncidentStatus } from '@oscrat/model';
import usePagination from '@/hooks/usePagination';
import ActionButton from '@/components/oscrat/ActionButton';
import { tableStyles } from '@/components/oscrat/tableStyles';
import PaginationControls from '@/components/shared/PaginationControls';
import { formatDateShort } from '@/utils/dateFormat';
import { sortByCreatedAtDesc } from '@/utils/sortItems';
import SeverityBadge from '@/components/oscrat/shared/SeverityBadge';
import {
  TableWrapper,
  TableHeader,
  TableRow,
} from '@/components/oscrat/versions/versionDetails/tabs/allTabs/shared';
import {
  INCIDENT_STATUS_MAP,
  INCIDENT_CLASSIFICATION_MAP,
  INCIDENT_ATTACK_TYPE_MAP,
  INCIDENT_SEVERITY_MAP,
} from '@/utils/incidentEnumMaps';
import { LISTING_PAGE_SIZE } from '@/constants/pagination';

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

  const pageSize = itemsPerPage || LISTING_PAGE_SIZE;
  const sortedIncidents = useMemo(
    () => sortByCreatedAtDesc(incidents),
    [incidents]
  );
  const {
    currentPage,
    totalPages,
    pageData,
    goToPreviousPage,
    goToNextPage,
    prevButtonDisabled,
    nextButtonDisabled,
  } = usePagination<OscratIncidentSummary>(sortedIncidents, pageSize);

  if (!ready) {
    return null;
  }

  const getStatusBadge = (status: IncidentStatus) => {
    const statusConfig: Record<
      IncidentStatus,
      { bgColor: string; textColor: string }
    > = {
      [IncidentStatus.PENDING]: {
        bgColor: 'bg-surface-muted',
        textColor: 'text-content',
      },
      [IncidentStatus.START]: {
        bgColor: 'bg-info-subtle',
        textColor: 'text-info-emphasis',
      },
      [IncidentStatus.DECLARED]: {
        bgColor: 'bg-warning-subtle',
        textColor: 'text-warning-emphasis',
      },
      [IncidentStatus.STABLE]: {
        bgColor: 'bg-info-subtle',
        textColor: 'text-info-emphasis',
      },
      [IncidentStatus.ACTIVE]: {
        bgColor: 'bg-warning-subtle',
        textColor: 'text-warning-emphasis',
      },
      [IncidentStatus.RESOLVED]: {
        bgColor: 'bg-success-subtle',
        textColor: 'text-success-emphasis',
      },
      [IncidentStatus.COMPLETED]: {
        bgColor: 'bg-success-subtle',
        textColor: 'text-success-emphasis',
      },
    };

    const config = statusConfig[status] || statusConfig[IncidentStatus.PENDING];

    return (
      <span
        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${config.bgColor} ${config.textColor}`}
      >
        {t(INCIDENT_STATUS_MAP[status])}
      </span>
    );
  };

  const handleViewDetails = (incidentId: string) => {
    router.push(
      `/organization/${slug}/products/${productId}/versions/${versionId}/incidents/${incidentId}`
    );
  };

  return (
    <div className="w-full">
      <TableWrapper>
        <table className="text-content-secondary w-full text-left text-sm">
          <TableHeader
            columns={[
              { label: t('oscrat.ui.versions.incidents.table-name') },
              { label: t('oscrat.ui.versions.incidents.table-status') },
              { label: t('oscrat.ui.versions.incidents.table-classification') },
              { label: t('oscrat.ui.versions.incidents.table-attack-type') },
              { label: t('oscrat.ui.versions.incidents.table-severity') },
              { label: t('oscrat.ui.versions.incidents.table-date-detected') },
              { label: t('oscrat.ui.versions.incidents.table-reporter') },
              { label: t('actions'), srOnly: true },
            ]}
          />
          <tbody className={tableStyles.tbody}>
            {pageData.map((incident) => (
              <TableRow
                key={incident.id}
                onClick={() => handleViewDetails(incident.id)}
                className="hover:bg-surface-muted cursor-pointer"
              >
                <td className={tableStyles.td}>
                  <div
                    className="max-w-[200px] truncate font-medium"
                    title={incident.name || ''}
                  >
                    {incident.name || (
                      <span className="text-content-placeholder italic">
                        {t('oscrat.ui.versions.incidents.unnamed')}
                      </span>
                    )}
                  </div>
                </td>
                <td className={tableStyles.td}>
                  {getStatusBadge(incident.status)}
                </td>
                <td className={tableStyles.td}>
                  <div
                    className="max-w-[150px] truncate"
                    title={t(
                      INCIDENT_CLASSIFICATION_MAP[incident.classification]
                    )}
                  >
                    {t(INCIDENT_CLASSIFICATION_MAP[incident.classification])}
                  </div>
                </td>
                <td className={tableStyles.td}>
                  <div
                    className="max-w-[150px] truncate"
                    title={t(INCIDENT_ATTACK_TYPE_MAP[incident.attackType])}
                  >
                    {t(INCIDENT_ATTACK_TYPE_MAP[incident.attackType])}
                  </div>
                </td>
                <td className={tableStyles.td}>
                  <SeverityBadge
                    severity={incident.severity}
                    label={t(INCIDENT_SEVERITY_MAP[incident.severity])}
                  />
                </td>
                <td className={tableStyles.td}>
                  {formatDateShort(incident.dateOfDetection)}
                </td>
                <td className={tableStyles.td}>
                  <div
                    className="max-w-[150px] truncate"
                    title={incident.reporter.name}
                  >
                    {incident.reporter.name}
                  </div>
                </td>
                <td className={tableStyles.td}>
                  <div className="flex items-center gap-2">
                    <ActionButton
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(incident.id);
                      }}
                      icon={<FaTrash size={12} />}
                      title={t('oscrat.ui.versions.incidents.delete-incident')}
                    >
                      {t('oscrat.ui.delete')}
                    </ActionButton>
                    <ActionButton
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewDetails(incident.id);
                      }}
                      icon={<FaEye size={12} />}
                      title={t('view')}
                    >
                      {t('view')}
                    </ActionButton>
                  </div>
                </td>
              </TableRow>
            ))}
            {!sortedIncidents.length && (
              <tr>
                <td
                  colSpan={8}
                  className="text-content-muted px-6 py-8 text-center text-sm"
                >
                  {t('oscrat.ui.versions.incidents.no-incidents-added')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </TableWrapper>

      {/* Pagination Controls */}
      {sortedIncidents.length > pageSize && (
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          prevButtonDisabled={prevButtonDisabled}
          nextButtonDisabled={nextButtonDisabled}
          goToPreviousPage={goToPreviousPage}
          goToNextPage={goToNextPage}
          showItemCount
          totalItems={sortedIncidents.length}
          itemsPerPage={pageSize}
        />
      )}
    </div>
  );
};

export default Table;
