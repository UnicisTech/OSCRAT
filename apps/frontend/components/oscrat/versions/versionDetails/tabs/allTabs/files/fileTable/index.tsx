import React from 'react';
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

const ITEMS_PER_PAGE = 10;

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
  if (!ready) return null;

  const {
    currentPage,
    totalPages,
    pageData,
    goToPreviousPage,
    goToNextPage,
    prevButtonDisabled,
    nextButtonDisabled,
  } = usePagination<Attachment>(attachments, ITEMS_PER_PAGE);

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

      <TableWrapper>
        <table className={tableStyles.table}>
          <TableHeader columns={tableHeaders} />
          <tbody className={tableStyles.tbody}>
            {(!attachments || attachments.length === 0) && (
              <tr>
                <td
                  colSpan={5}
                  className="text-content-muted px-6 py-8 text-center text-sm"
                >
                  {t('oscrat.ui.no-files-added')}
                </td>
              </tr>
            )}
            {pageData.map((attachment) => (
              <TableRow key={attachment.id}>
                <td className={tableStyles.td}>
                  <div className="font-medium">{attachment.name}</div>
                </td>
                <td className={tableStyles.td}>
                  {attachment.description || t('oscrat.ui.no-description')}
                </td>
                <td className={tableStyles.td}>
                  {formatDateShort(attachment.createdAt)}
                </td>
                <td className={tableStyles.td}>
                  {attachment.createdByUser
                    ? `${attachment.createdByUser.firstName} ${attachment.createdByUser.lastName}`.trim() ||
                      attachment.createdByUser.name
                    : t('oscrat.ui.unknown')}
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
            ))}
          </tbody>
        </table>
      </TableWrapper>

      {attachments.length > ITEMS_PER_PAGE && (
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          prevButtonDisabled={prevButtonDisabled}
          nextButtonDisabled={nextButtonDisabled}
          goToPreviousPage={goToPreviousPage}
          goToNextPage={goToNextPage}
        />
      )}
    </div>
  );
};

export default FileTable;
