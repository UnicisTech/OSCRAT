import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import {
  TabHeader,
  TableWrapper,
  TableHeader,
  TableRow,
  TabActionButton,
  TabLoading,
} from '@/components/oscrat/versions/versionDetails/tabs/allTabs/shared';
import { tableStyles } from '@/components/oscrat/tableStyles';
import { StatusBadge } from '@/components/shared';
import { useVersionContext } from '@/context/VersionContext';
import { useTeamContext } from '@/context/TeamContext';
import { useListDocumentation } from '@/lib/api/hooks';
import { CreateDocumentationModal } from '@/components/documentation';
import { DocumentationStatus, DocumentationVisibility } from '@oscrat/model';
import { formatDateShort } from '@/utils/dateFormat';

const STATUS_OPTIONS = Object.values(DocumentationStatus);
const VISIBILITY_OPTIONS = Object.values(DocumentationVisibility);
type SortOrder = 'newest' | 'oldest';

export default function Documentation() {
  const router = useRouter();
  const { t } = useTranslation('common');
  const { versionId, productId } = useVersionContext();
  const { teamContext } = useTeamContext();
  const { team } = teamContext;
  const slug = team?.slug || '';

  const [createVisible, setCreateVisible] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [visibilityFilter, setVisibilityFilter] = useState<string>('All');
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');

  const { data: documentation, isLoading } = useListDocumentation(slug, {
    productId,
    versionId,
  });

  const filteredDocumentation = useMemo(() => {
    if (!documentation) return [];

    let filtered = [...documentation];

    if (statusFilter !== 'All') {
      filtered = filtered.filter((doc) => doc.status === statusFilter);
    }

    if (visibilityFilter !== 'All') {
      filtered = filtered.filter((doc) => doc.visibility === visibilityFilter);
    }

    filtered.sort((a, b) => {
      const dateA = new Date(a.updatedAt).getTime();
      const dateB = new Date(b.updatedAt).getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

    return filtered;
  }, [documentation, statusFilter, visibilityFilter, sortOrder]);

  const tableHeaders = [t('title'), t('status'), t('visibility'), t('updated')];

  if (isLoading || !team) {
    return (
      <div className="border-line bg-surface rounded-card flex w-full flex-col items-center border p-4">
        <TabLoading />
      </div>
    );
  }

  return (
    <div className="border-line bg-surface rounded-card flex w-full flex-col items-center border p-4">
      <div className="w-full">
        <TabHeader title={t('oscrat.ui.documentation.title')}>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <label
                htmlFor="status-filter"
                className="text-content text-sm font-medium"
              >
                {t('status')}
              </label>
              <select
                id="status-filter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border-line focus:ring-primary rounded-input border px-1 py-1 text-sm focus:outline-none focus:ring-1"
              >
                <option value="All">{t('all')}</option>
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {t(`oscrat.ui.documentation.status.${opt.toLowerCase()}`)}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <label
                htmlFor="visibility-filter"
                className="text-content text-sm font-medium"
              >
                {t('visibility')}
              </label>
              <select
                id="visibility-filter"
                value={visibilityFilter}
                onChange={(e) => setVisibilityFilter(e.target.value)}
                className="border-line focus:ring-primary rounded-input border px-1 py-1 text-sm focus:outline-none focus:ring-1"
              >
                <option value="All">{t('all')}</option>
                {VISIBILITY_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {t(
                      `oscrat.ui.documentation.visibility.${opt.toLowerCase()}`
                    )}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <label
                htmlFor="sort-order"
                className="text-content text-sm font-medium"
              >
                {t('updated')}
              </label>
              <select
                id="sort-order"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as SortOrder)}
                className="border-line focus:ring-primary rounded-input border px-1 py-1 text-sm focus:outline-none focus:ring-1"
              >
                <option value="newest">{t('newest-first')}</option>
                <option value="oldest">{t('oldest-first')}</option>
              </select>
            </div>
          </div>
          <TabActionButton onClick={() => setCreateVisible(true)}>
            {t('oscrat.ui.documentation.add')}
          </TabActionButton>
        </TabHeader>

        <TableWrapper>
          <table className={tableStyles.table}>
            <TableHeader columns={tableHeaders.map((h) => ({ label: h }))} />
            <tbody className={tableStyles.tbody}>
              {filteredDocumentation.length > 0 ? (
                filteredDocumentation.map((doc) => (
                  <TableRow
                    key={doc.id}
                    onClick={() =>
                      router.push(
                        `/organization/${slug}/documentation/${doc.id}`
                      )
                    }
                    className="hover:bg-surface-muted cursor-pointer transition-colors"
                  >
                    <td className={tableStyles.td}>
                      <div className="font-medium">{doc.title}</div>
                      <div className="text-content-muted text-xs">
                        {doc.version}
                      </div>
                    </td>
                    <td className={tableStyles.td}>
                      <StatusBadge
                        value={doc.status}
                        label={t(
                          `oscrat.ui.documentation.status.${doc.status.toLowerCase()}`
                        )}
                      />
                    </td>
                    <td className={tableStyles.td}>
                      <span
                        className={`text-sm ${
                          doc.visibility === 'PUBLIC'
                            ? 'text-success'
                            : 'text-content-muted'
                        }`}
                      >
                        {doc.visibility === 'PUBLIC'
                          ? t('oscrat.ui.documentation.visibility.public')
                          : t('oscrat.ui.documentation.visibility.private')}
                      </span>
                    </td>
                    <td className={tableStyles.td}>
                      <span className="text-content-muted text-sm">
                        {formatDateShort(doc.updatedAt)}
                      </span>
                    </td>
                  </TableRow>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    className="text-content-muted px-6 py-8 text-center"
                  >
                    {t('oscrat.ui.documentation.no-documents')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </TableWrapper>
      </div>

      <CreateDocumentationModal
        visible={createVisible}
        setVisible={setCreateVisible}
        defaultProductId={productId}
        defaultVersionId={versionId}
      />
    </div>
  );
}
