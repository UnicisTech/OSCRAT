import React from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useTranslation } from 'next-i18next';
import Button from '@/components/button';

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
          <p className="text-content-secondary mb-2 text-sm">
            {t('showing-items', {
              start: startItem,
              end: endItem,
              total: totalItems,
              defaultValue: `Showing ${startItem}-${endItem} of ${totalItems} items`,
            })}
          </p>
        )}
        <div className="inline-flex items-stretch">
          <Button
            variant="secondary"
            size="s"
            onClick={goToPreviousPage}
            disabled={prevButtonDisabled}
            title={t('previous-page')}
            aria-label={t('previous-page')}
            className="rounded-r-none"
            icon={<FaChevronLeft />}
          />
          <span
            className="border-line bg-surface text-content-secondary flex items-center border-b border-t px-4 py-2 text-sm font-medium"
            aria-current="page"
          >
            {currentPage} / {totalPages}
          </span>
          <Button
            variant="secondary"
            size="s"
            onClick={goToNextPage}
            disabled={nextButtonDisabled}
            title={t('next-page')}
            aria-label={t('next-page')}
            className="rounded-l-none"
            icon={<FaChevronRight />}
          />
        </div>
      </div>
    </div>
  );
};

export default PaginationControls;
