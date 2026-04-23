import { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { StatusBadge, WithLoadingAndError, FilterDropdown, PaginationControls } from '@/components/shared';
import { useDocumentationList } from '@/hooks/useDocumentation';

const ITEMS_PER_PAGE = 15;

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
      { value: 'PUBLISHED', label: t('oscrat.ui.documentation.status.published') },
      { value: 'ARCHIVED', label: t('oscrat.ui.documentation.status.archived') },
    ],
    [t]
  );

  const levelOptions = useMemo(
    () => [
      { value: 'all', label: t('all') },
      { value: 'ORGANIZATION', label: t('oscrat.ui.documentation.level.organization') },
      { value: 'PRODUCT', label: t('oscrat.ui.documentation.level.product') },
    ],
    [t]
  );

  const filteredDocs = useMemo(() => {
    return documentation?.filter((doc) => {
      if (statusFilter !== 'all' && doc.status !== statusFilter) return false;
      const docLevel = doc.productId ? 'PRODUCT' : 'ORGANIZATION';
      if (levelFilter !== 'all' && docLevel !== levelFilter) return false;
      return true;
    }) || [];
  }, [documentation, statusFilter, levelFilter]);

  const totalPages = Math.ceil(filteredDocs.length / ITEMS_PER_PAGE);
  const paginatedDocs = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredDocs.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredDocs, currentPage]);

  const handleRowClick = (docId: string) => {
    router.push(`/organization/${slug}/documentation/${docId}`);
  };

  return (
    <WithLoadingAndError isLoading={isLoading} error={isError}>
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <FilterDropdown
              value={statusFilter}
              options={statusOptions}
              onChange={setStatusFilter}
              label={t('status')}
              isOpen={openDropdown === 'status'}
              onToggle={() => setOpenDropdown(openDropdown === 'status' ? null : 'status')}
              onClose={() => setOpenDropdown(null)}
            />

            <FilterDropdown
              value={levelFilter}
              options={levelOptions}
              onChange={setLevelFilter}
              label={t('oscrat.ui.documentation.level.label')}
              isOpen={openDropdown === 'level'}
              onToggle={() => setOpenDropdown(openDropdown === 'level' ? null : 'level')}
              onClose={() => setOpenDropdown(null)}
            />

            {/* Clear Filters */}
            {(statusFilter !== 'all' || levelFilter !== 'all') && (
              <button
                onClick={() => { setStatusFilter('all'); setLevelFilter('all'); }}
                className="px-3 py-2 text-sm text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                {t('clear-filters')}
              </button>
            )}
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-lg bg-white shadow-sm min-h-[400px]">
            <table className="min-w-full divide-y divide-gray-200 text-left text-sm text-gray-600">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-gray-700">
                    {t('title')}
                  </th>
                  <th className="hidden md:table-cell px-4 py-3 text-xs font-medium uppercase tracking-wider text-gray-700 whitespace-nowrap">
                    {t('oscrat.ui.documentation.level.label')}
                  </th>
                  <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-gray-700 whitespace-nowrap">
                    {t('status')}
                  </th>
                  <th className="hidden sm:table-cell px-4 py-3 text-xs font-medium uppercase tracking-wider text-gray-700 whitespace-nowrap">
                    {t('visibility')}
                  </th>
                  <th className="hidden lg:table-cell px-4 py-3 text-xs font-medium uppercase tracking-wider text-gray-700 whitespace-nowrap">
                    {t('updated')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {paginatedDocs.length > 0 ? (
                  paginatedDocs.map((doc) => (
                    <tr
                      key={doc.id}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleRowClick(doc.id)}
                    >
                      <td className="px-4 py-3">
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-900">{doc.title}</span>
                          {doc.productName && (
                            <span className="text-xs text-gray-500">
                              {doc.productName}
                              {doc.versionName && ` ${doc.versionName}`}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="hidden md:table-cell px-4 py-3">
                        <span className="text-sm text-gray-600">
                          {doc.productId
                            ? t('oscrat.ui.documentation.level.product')
                            : t('oscrat.ui.documentation.level.organization')}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge
                          value={doc.status}
                          label={t(`oscrat.ui.documentation.status.${doc.status.toLowerCase()}`)}
                        />
                      </td>
                      <td className="hidden sm:table-cell px-4 py-3">
                        <span className={`text-sm ${doc.visibility === 'PUBLIC' ? 'text-green-600' : 'text-gray-500'}`}>
                          {doc.visibility === 'PUBLIC'
                            ? t('oscrat.ui.documentation.visibility.public')
                            : t('oscrat.ui.documentation.visibility.private')}
                        </span>
                      </td>
                      <td className="hidden lg:table-cell px-4 py-3">
                        <span className="text-sm text-gray-500">
                          {new Date(doc.updatedAt).toLocaleDateString()}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
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
            goToNextPage={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            showItemCount
            totalItems={filteredDocs.length}
            itemsPerPage={ITEMS_PER_PAGE}
          />
        </div>
      </div>
    </WithLoadingAndError>
  );
};

export default DocumentationList;
