import React from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useTranslation } from 'next-i18next';

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  prevButtonDisabled: boolean;
  nextButtonDisabled: boolean;
  goToPreviousPage: () => void;
  goToNextPage: () => void;
  showItemCount?: boolean;
  totalItems?: number;
  itemsPerPage?: number;
}

const PaginationControls: React.FC<PaginationControlsProps> = ({
  currentPage,
  totalPages,
  prevButtonDisabled,
  nextButtonDisabled,
  goToPreviousPage,
  goToNextPage,
  showItemCount = false,
  totalItems = 0,
  itemsPerPage = 0,
}) => {
  const { t } = useTranslation('common');

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="mt-4 flex justify-center pb-4">
      <div className="inline-flex flex-col items-center">
        {showItemCount && totalItems > 0 && (
          <p className="mb-2 text-sm text-gray-600">
            {t('showing-items', {
              start: startItem,
              end: endItem,
              total: totalItems,
              defaultValue: `Showing ${startItem}-${endItem} of ${totalItems} items`,
            })}
          </p>
        )}
        <div className="inline-flex">
          <button
            onClick={goToPreviousPage}
            disabled={prevButtonDisabled}
            title={t('previous-page')}
            aria-label={t('previous-page')}
            className={`rounded-l-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium ${
              prevButtonDisabled
                ? 'cursor-not-allowed text-gray-400'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <FaChevronLeft />
          </button>
          <span
            className="border-b border-t border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700"
            aria-current="page"
          >
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={goToNextPage}
            disabled={nextButtonDisabled}
            title={t('next-page')}
            aria-label={t('next-page')}
            className={`rounded-r-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium ${
              nextButtonDisabled
                ? 'cursor-not-allowed text-gray-400'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <FaChevronRight />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaginationControls;
