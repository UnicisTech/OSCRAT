import React from 'react';
import Version from '../../../version';
import { useTranslation } from 'react-i18next';
import type { OscratProductVersionSummary } from '@oscrat/model';
import usePagination from '@/hooks/usePagination';
import PaginationControls from '@/components/shared/PaginationControls';

const VERSIONS_PER_PAGE = 10;

type SupportedTabProps = {
  data: OscratProductVersionSummary[];
};

export default function SupportedTab({ data }: SupportedTabProps) {
  const { t, ready } = useTranslation('common');
  const list = data ?? [];

  const {
    currentPage,
    totalPages,
    pageData: paginatedVersions,
    goToPreviousPage,
    goToNextPage,
    prevButtonDisabled,
    nextButtonDisabled,
  } = usePagination(list, VERSIONS_PER_PAGE);

  if (!ready) return null;

  return (
    <div>
      <div className="flex flex-col gap-4">
        {paginatedVersions.map((versionData) => (
          <Version key={versionData.id} data={versionData as any} />
        ))}
      </div>

      {totalPages > 1 && (
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          prevButtonDisabled={prevButtonDisabled}
          nextButtonDisabled={nextButtonDisabled}
          goToPreviousPage={goToPreviousPage}
          goToNextPage={goToNextPage}
          showItemCount
          totalItems={list.length}
          itemsPerPage={VERSIONS_PER_PAGE}
        />
      )}

      {list.length === 0 && (
        <div className="py-8 text-center">
          <div className="text-content-muted">
            {t('oscrat.ui.no-supported-versions-available')}
          </div>
        </div>
      )}
    </div>
  );
}
