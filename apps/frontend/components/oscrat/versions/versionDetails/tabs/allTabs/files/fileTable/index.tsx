import React from 'react';
import { IoAdd } from 'react-icons/io5';
import { useTranslation } from 'next-i18next';
import type { Attachment } from '@/types';

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

  const tableHeaders = [
    t('oscrat.ui.file-name'),
    t('oscrat.ui.file-description'),
    t('oscrat.ui.date-added'),
    t('oscrat.ui.added-by'),
    '',
  ];

  return (
    <div className="w-full rounded-lg border border-gray-400 bg-white p-4">
      <div className="mb-4">
        <button
          onClick={onAddFileClick}
          className="flex items-center justify-center rounded-md border border-gray-600 bg-white px-3 py-1 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
        >
          <IoAdd className="mr-2" size={18} />
          {t('oscrat.ui.add-file')}
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-200 text-xs text-gray-700">
            <tr>
              {tableHeaders.map((header) => (
                <th key={header} scope="col" className="px-6 py-3">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {attachments.map((attachment) => (
              <tr
                key={attachment.id}
                className="border-b bg-white hover:bg-gray-50"
              >
                <td className="whitespace-nowrap px-6 py-4 font-medium text-gray-900">
                  {attachment.name}
                </td>
                <td className="px-6 py-4">
                  {attachment.description || t('oscrat.ui.no-description')}
                </td>
                <td className="px-6 py-4">
                  {new Date(attachment.createdAt).toLocaleDateString('en-GB')}
                </td>
                <td className="px-6 py-4">
                  {attachment.createdByUser
                    ? `${attachment.createdByUser.firstName} ${attachment.createdByUser.lastName}`.trim() ||
                      attachment.createdByUser.name
                    : t('oscrat.ui.unknown')}
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="flex gap-6">
                    {onDownloadFile && (
                      <button
                        onClick={() =>
                          onDownloadFile(attachment.id, attachment.name)
                        }
                        disabled={downloadingFiles.has(attachment.id)}
                        className={`${
                          downloadingFiles.has(attachment.id)
                            ? 'cursor-not-allowed text-gray-400'
                            : 'text-blue-600 hover:text-blue-800'
                        }`}
                        title={
                          downloadingFiles.has(attachment.id)
                            ? t('oscrat.ui.downloading')
                            : t('oscrat.ui.download')
                        }
                      >
                        {downloadingFiles.has(attachment.id)
                          ? t('oscrat.ui.downloading')
                          : t('oscrat.ui.download')}
                      </button>
                    )}
                    {onDeleteFile && (
                      <button
                        onClick={() => onDeleteFile(attachment.id)}
                        disabled={downloadingFiles.has(attachment.id)}
                        className={`${
                          downloadingFiles.has(attachment.id)
                            ? 'cursor-not-allowed text-gray-400'
                            : 'text-red-600 hover:text-red-800'
                        }`}
                        title={
                          downloadingFiles.has(attachment.id)
                            ? t('oscrat.ui.download-in-progress')
                            : t('delete')
                        }
                      >
                        {t('delete')}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FileTable;
