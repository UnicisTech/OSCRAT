import React, { useMemo } from 'react';
import { IoAdd } from 'react-icons/io5';
import { FaDownload, FaTrash } from 'react-icons/fa';
import { useTranslation } from 'next-i18next';
import type { Attachment } from '@/types';
import {
  TabHeader,
  TableWrapper,
  TableHeader,
  TableRow,
  TabActionButton,
} from '@/components/oscrat/versions/versionDetails/tabs/allTabs/shared';
import { tableStyles } from '@/components/oscrat/tableStyles';
import usePagination from '@/hooks/usePagination';
import PaginationControls from '@/components/shared/PaginationControls';
import ActionButton from '@/components/oscrat/ActionButton';
import { formatDateShort } from '@/utils/dateFormat';
import { sortByCreatedAtDesc } from '@/utils/sortItems';
import { LISTING_PAGE_SIZE } from '@/constants/pagination';

interface FileTableProps {
  attachments: Attachment[];
  onAddFileClick: () => void;
  onDownloadFile?: (fileId: string, filename: string) => void;
  onDeleteFile?: (fileId: string) => void;
  downloadingFiles?: Set<string>;
}

const FileTable: React.FC<FileTableProps> = ({
  attachments,
  onAddFileClick,
  onDownloadFile,
  onDeleteFile,
  downloadingFiles = new Set(),
}) => {
  const { t, ready } = useTranslation('common');
  const sortedAttachments = useMemo(
    () => sortByCreatedAtDesc(attachments),
    [attachments]
  );
  const {
    currentPage,
    totalPages,
    pageData,
    goToPreviousPage,
    goToNextPage,
    prevButtonDisabled,
    nextButtonDisabled,
  } = usePagination<Attachment>(sortedAttachments, LISTING_PAGE_SIZE);
  if (!ready) return null;

  const tableHeaders = [
    { label: t('oscrat.ui.file-name') },
    { label: t('oscrat.ui.file-description') },
    { label: t('oscrat.ui.date-added') },
    { label: t('oscrat.ui.added-by') },
    { label: t('actions'), className: 'text-right' },
  ];

  return (
    <div className="w-full">
      <TabHeader title={t('oscrat.ui.files')}>
        <TabActionButton onClick={onAddFileClick} icon={<IoAdd size={18} />}>
          {t('oscrat.ui.add-file')}
        </TabActionButton>
      </TabHeader>

      {sortedAttachments.length > 0 ? (
        <TableWrapper>
          <table className={tableStyles.table}>
            <TableHeader columns={tableHeaders} />
            <tbody className={tableStyles.tbody}>
              {pageData.map((attachment) => {
                const addedByName =
                  attachment.createdByUser?.name || t('oscrat.ui.unknown');
                const descriptionText =
                  attachment.description || t('oscrat.ui.no-description');
                return (
                  <TableRow key={attachment.id}>
                    <td className={tableStyles.td}>
                      <div
                        className="truncate font-medium"
                        title={attachment.name}
                      >
                        {attachment.name}
                      </div>
                    </td>
                    <td className={tableStyles.td} title={descriptionText}>
                      {descriptionText}
                    </td>
                    <td className={tableStyles.td}>
                      {formatDateShort(attachment.createdAt)}
                    </td>
                    <td className={tableStyles.td} title={addedByName}>
                      {addedByName}
                    </td>
                    <td className={`${tableStyles.td} text-right`}>
                      <div className="flex items-center justify-end space-x-1">
                        {onDownloadFile && (
                          <ActionButton
                            onClick={() =>
                              onDownloadFile(attachment.id, attachment.name)
                            }
                            disabled={downloadingFiles.has(attachment.id)}
                            icon={<FaDownload size={12} />}
                            title={
                              downloadingFiles.has(attachment.id)
                                ? t('oscrat.ui.downloading')
                                : t('oscrat.ui.download')
                            }
                          >
                            {downloadingFiles.has(attachment.id)
                              ? t('oscrat.ui.downloading')
                              : t('oscrat.ui.download')}
                          </ActionButton>
                        )}
                        {onDeleteFile && (
                          <ActionButton
                            onClick={() => onDeleteFile(attachment.id)}
                            disabled={downloadingFiles.has(attachment.id)}
                            icon={<FaTrash size={12} />}
                            title={
                              downloadingFiles.has(attachment.id)
                                ? t('oscrat.ui.download-in-progress')
                                : t('delete')
                            }
                          >
                            {t('delete')}
                          </ActionButton>
                        )}
                      </div>
                    </td>
                  </TableRow>
                );
              })}
            </tbody>
          </table>
        </TableWrapper>
      ) : (
        <div className="text-content-muted px-6 py-8 text-center text-sm">
          {t('oscrat.ui.no-files-added')}
        </div>
      )}

      {sortedAttachments.length > LISTING_PAGE_SIZE && (
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          prevButtonDisabled={prevButtonDisabled}
          nextButtonDisabled={nextButtonDisabled}
          goToPreviousPage={goToPreviousPage}
          goToNextPage={goToNextPage}
          showItemCount
          totalItems={sortedAttachments.length}
          itemsPerPage={LISTING_PAGE_SIZE}
        />
      )}
    </div>
  );
};

export default FileTable;
