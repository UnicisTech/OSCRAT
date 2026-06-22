import React from 'react';
import Version from '../../../version';
import { useTranslation } from 'react-i18next';
import type { OscratProductVersionSummary } from '@oscrat/model';
import usePagination from '@/hooks/usePagination';
import PaginationControls from '@/components/shared/PaginationControls';
import { LISTING_PAGE_SIZE } from '@/constants/pagination';
import { sortByCreatedAtDesc } from '@/utils/sortItems';

type NotSupportedTabProps = {
  data: OscratProductVersionSummary[];
};

export default function NotSupportedTab({ data }: NotSupportedTabProps) {
  const { t, ready } = useTranslation('common');
  const list = sortByCreatedAtDesc(data);

  const {
    currentPage,
    totalPages,
    pageData: paginatedVersions,
    goToPreviousPage,
    goToNextPage,
    prevButtonDisabled,
    nextButtonDisabled,
  } = usePagination(list, LISTING_PAGE_SIZE);

  if (!ready) return null;

  return (
    <div>
      <div className="flex flex-col gap-4">
        {paginatedVersions.map((versionData) => (
          <Version
            key={versionData.id}
            data={versionData as any}
            variant="notSupported"
          />
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
          itemsPerPage={LISTING_PAGE_SIZE}
        />
      )}

      {list.length === 0 && (
        <div className="py-8 text-center">
          <div className="text-content-muted">
            {t('oscrat.ui.no-unsupported-versions-available')}
          </div>
        </div>
      )}
    </div>
  );
}
