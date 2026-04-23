import React from 'react';
import Version from '../../../version';
import { useTranslation } from 'react-i18next';
import type { OscratProductVersionSummary } from '@oscrat/model';
import usePagination from '@/hooks/usePagination';
import PaginationControls from '@/components/shared/PaginationControls';

const VERSIONS_PER_PAGE = 10;

type NotSupportedTabProps = {
  data: OscratProductVersionSummary[];
};

export default function NotSupportedTab({ data }: NotSupportedTabProps) {
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
          itemsPerPage={VERSIONS_PER_PAGE}
        />
      )}

      {list.length === 0 && (
        <div className="py-8 text-center">
          <div className="text-gray-500 dark:text-gray-400">
            {t('oscrat.ui.no-unsupported-versions-available')}
          </div>
        </div>
      )}
    </div>
  );
}
