import { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import {
  StatusBadge,
  WithLoadingAndError,
  FilterDropdown,
  PaginationControls,
} from '@/components/shared';
import { useDocumentationList } from '@/hooks/useDocumentation';
import { Button } from '@/components/shared';
import { formatDateShort } from '@/utils/dateFormat';
import { LISTING_PAGE_SIZE } from '@/constants/pagination';

const DocumentationList = () => {
  const router = useRouter();
  const { slug } = router.query as { slug: string };
  const { documentation, isLoading, isError } = useDocumentationList(slug);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const { t } = useTranslation('common');

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, levelFilter]);

  const statusOptions = useMemo(
    () => [
      { value: 'all', label: t('all') },
      { value: 'DRAFT', label: t('oscrat.ui.documentation.status.draft') },
      {
        value: 'PUBLISHED',
        label: t('oscrat.ui.documentation.status.published'),
      },
      {
        value: 'ARCHIVED',
        label: t('oscrat.ui.documentation.status.archived'),
      },
    ],
    [t]
  );

  const levelOptions = useMemo(
    () => [
      { value: 'all', label: t('all') },
      {
        value: 'ORGANIZATION',
        label: t('oscrat.ui.documentation.level.organization'),
      },
      { value: 'PRODUCT', label: t('oscrat.ui.documentation.level.product') },
    ],
    [t]
  );

  const filteredDocs = useMemo(() => {
    return (
      documentation?.filter((doc) => {
        if (statusFilter !== 'all' && doc.status !== statusFilter) return false;
        const docLevel = doc.productId ? 'PRODUCT' : 'ORGANIZATION';
        if (levelFilter !== 'all' && docLevel !== levelFilter) return false;
        return true;
      }) || []
    );
  }, [documentation, statusFilter, levelFilter]);

  const totalPages = Math.ceil(filteredDocs.length / LISTING_PAGE_SIZE);
  const paginatedDocs = useMemo(() => {
    const startIndex = (currentPage - 1) * LISTING_PAGE_SIZE;
    return filteredDocs.slice(startIndex, startIndex + LISTING_PAGE_SIZE);
  }, [filteredDocs, currentPage]);

  const handleRowClick = (docId: string) => {
    router.push(`/organization/${slug}/documentation/${docId}`);
  };

  return (
    <WithLoadingAndError isLoading={isLoading} error={isError}>
      <div className="border-line bg-surface rounded-card border p-6">
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <FilterDropdown
              value={statusFilter}
              options={statusOptions}
              onChange={setStatusFilter}
              label={t('status')}
              isOpen={openDropdown === 'status'}
              onToggle={() =>
                setOpenDropdown(openDropdown === 'status' ? null : 'status')
              }
              onClose={() => setOpenDropdown(null)}
            />

            <FilterDropdown
              value={levelFilter}
              options={levelOptions}
              onChange={setLevelFilter}
              label={t('oscrat.ui.documentation.level.label')}
              isOpen={openDropdown === 'level'}
              onToggle={() =>
                setOpenDropdown(openDropdown === 'level' ? null : 'level')
              }
              onClose={() => setOpenDropdown(null)}
            />

            {/* Clear Filters */}
            {(statusFilter !== 'all' || levelFilter !== 'all') && (
              <Button
                variant="secondary"
                size="m"
                onClick={() => {
                  setStatusFilter('all');
                  setLevelFilter('all');
                }}
              >
                {t('clear-filters')}
              </Button>
            )}
          </div>

          {/* Table */}
          <div className="bg-surface border-line rounded-card min-h-[400px] overflow-hidden border">
            <table className="text-content-secondary divide-line-subtle w-full table-fixed divide-y text-left text-sm">
              <thead className="bg-surface-muted text-content border-line-header border-b">
                <tr>
                  <th className="text-content text-b2 w-[40%] p-4 font-medium">
                    {t('title')}
                  </th>
                  <th className="text-content text-b2 hidden w-[18%] whitespace-nowrap p-4 font-medium md:table-cell">
                    {t('oscrat.ui.documentation.level.label')}
                  </th>
                  <th className="text-content text-b2 w-[18%] whitespace-nowrap p-4 font-medium">
                    {t('status')}
                  </th>
                  <th className="text-content text-b2 hidden w-[12%] whitespace-nowrap p-4 font-medium sm:table-cell">
                    {t('visibility')}
                  </th>
                  <th className="text-content text-b2 hidden w-[12%] whitespace-nowrap p-4 font-medium lg:table-cell">
                    {t('updated')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-surface divide-line-subtle divide-y">
                {paginatedDocs.length > 0 ? (
                  paginatedDocs.map((doc) => (
                    <tr
                      key={doc.id}
                      className="hover:bg-surface-muted cursor-pointer"
                      onClick={() => handleRowClick(doc.id)}
                    >
                      <td className="min-w-0 px-4 py-3">
                        <div className="flex min-w-0 flex-col">
                          <span
                            className="text-content truncate font-medium"
                            title={doc.title}
                          >
                            {doc.title}
                          </span>
                          {doc.productName && (
                            <span
                              className="text-content-muted truncate text-xs"
                              title={`${doc.productName}${doc.versionName ? ` ${doc.versionName}` : ''}`}
                            >
                              {doc.productName}
                              {doc.versionName && ` ${doc.versionName}`}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="hidden px-4 py-3 md:table-cell">
                        <span className="text-content-secondary text-sm">
                          {doc.productId
                            ? t('oscrat.ui.documentation.level.product')
                            : t('oscrat.ui.documentation.level.organization')}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge
                          value={doc.status}
                          label={t(
                            `oscrat.ui.documentation.status.${doc.status.toLowerCase()}`
                          )}
                        />
                      </td>
                      <td className="hidden px-4 py-3 sm:table-cell">
                        <span
                          className={`text-sm ${doc.visibility === 'PUBLIC' ? 'text-success' : 'text-content-muted'}`}
                        >
                          {doc.visibility === 'PUBLIC'
                            ? t('oscrat.ui.documentation.visibility.public')
                            : t('oscrat.ui.documentation.visibility.private')}
                        </span>
                      </td>
                      <td className="hidden px-4 py-3 lg:table-cell">
                        <span className="text-content-muted text-sm">
                          {formatDateShort(doc.updatedAt)}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="text-content-muted px-6 py-8 text-center"
                    >
                      {t('oscrat.ui.documentation.no-documents')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages || 1}
            prevButtonDisabled={currentPage === 1}
            nextButtonDisabled={currentPage >= totalPages}
            goToPreviousPage={() => setCurrentPage((p) => Math.max(1, p - 1))}
            goToNextPage={() =>
              setCurrentPage((p) => Math.min(totalPages, p + 1))
            }
            showItemCount
            totalItems={filteredDocs.length}
            itemsPerPage={LISTING_PAGE_SIZE}
          />
        </div>
      </div>
    </WithLoadingAndError>
  );
};

export default DocumentationList;
