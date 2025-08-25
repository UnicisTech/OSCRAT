import React from 'react';
import { FaTrashAlt, FaDownload } from 'react-icons/fa';
import { useTranslation } from 'next-i18next';
import type { Attachment } from '@/types';
import { useVersionContext } from '@/context/VersionContext';
import { useOscratVersion } from '@/hooks/oscrat/useOscratVersion';
import { useOscratVersionSbomJobs } from '@/hooks/oscrat/useOscratJobs';

interface SsmTableProps {
  sbomData: Attachment[];
  onImportClick: () => void;
  onGenerate: () => void;
  onValidate: (id: string) => void;
  onDelete: (id: string) => void;
  onDownload: (id: string, filename: string) => void;
  isLoading?: boolean;
}

const Table: React.FC<SsmTableProps> = ({
  sbomData,
  onImportClick,
  onGenerate,
  onValidate,
  onDelete,
  onDownload,
}) => {
  const { teamId, productId, versionId } = useVersionContext();
  const { version } = useOscratVersion(teamId, productId, versionId);
  const { isLoading: isSbomGenerating } = useOscratVersionSbomJobs(
    teamId,
    productId,
    versionId
  );

  const hasRepositoryDefined =
    version?.repository && Object.keys(version.repository).length > 0;

  const { t, ready } = useTranslation('common');

  if (!ready) {
    return null;
  }

  const tableHeaders = [
    'Name',
    'Description',
    'Date Added',
    'Added by',
    'Actions',
  ];

  if (sbomData.length === 0) {
    return (
      <div className="w-full rounded-lg">
        <div className="mb-4 flex space-x-2">
          <button
            onClick={onImportClick}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50"
          >
            {t('import')}
          </button>
          <button
            onClick={
              hasRepositoryDefined && !isSbomGenerating ? onGenerate : undefined
            }
            disabled={!hasRepositoryDefined || isSbomGenerating}
            className={`rounded-md border px-4 py-2 text-sm font-medium ${
              hasRepositoryDefined && !isSbomGenerating
                ? 'border-gray-300 bg-white text-gray-900 hover:bg-gray-50'
                : 'cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400'
            }`}
          >
            {t('generate')}
          </button>
        </div>
        <div className="flex flex-col items-center justify-center py-12 text-gray-500">
          <p className="text-sm">{t('oscrat.ui.no-sbom-added')}</p>
          {!hasRepositoryDefined && (
            <p className="mt-2 text-sm text-red-600">
              {t('oscrat.ui.to-generate-sbom')}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full rounded-lg">
      <div className="mb-4 flex space-x-2">
        <button
          onClick={onImportClick}
          className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50"
        >
          {t('import')}
        </button>
        <button
          onClick={
            hasRepositoryDefined && !isSbomGenerating ? onGenerate : undefined
          }
          disabled={!hasRepositoryDefined || isSbomGenerating}
          className={`rounded-md border px-4 py-2 text-sm font-medium ${
            hasRepositoryDefined && !isSbomGenerating
              ? 'border-gray-300 bg-white text-gray-900 hover:bg-gray-50'
              : 'cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400'
          }`}
        >
          {isSbomGenerating ? `${t('generate')}...` : t('generate')}
        </button>
        {!hasRepositoryDefined && (
          <div className="flex items-center text-sm text-red-600">
            <span className="mr-1">⚠️</span>
            <span>{t('oscrat.ui.to-generate-sbom')}</span>
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-200 text-xs text-gray-900">
            <tr>
              {tableHeaders.map((header) => (
                <th key={header} scope="col" className="px-6 py-3">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {sbomData.map((attachment) => (
              <tr key={attachment.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900">
                  {attachment.name}
                </td>
                <td className="px-6 py-4">
                  {attachment.description || 'No description'}
                </td>
                <td className="px-6 py-4">
                  {new Date(attachment.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  {attachment.createdByUser
                    ? `${attachment.createdByUser.firstName} ${attachment.createdByUser.lastName}`.trim() ||
                      attachment.createdByUser.name
                    : 'Unknown'}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-6">
                    <button
                      onClick={() => onValidate(attachment.id)}
                      className="rounded border border-gray-300 bg-transparent px-2 py-1 text-xs text-gray-700 hover:bg-gray-50"
                    >
                      {t('validate')}
                    </button>

                    <button
                      onClick={() => onDownload(attachment.id, attachment.name)}
                      className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
                      title={t('oscrat.ui.download')}
                    >
                      <FaDownload size={14} className="text-gray-500" />
                      <span className="text-xs">{t('oscrat.ui.download')}</span>
                    </button>

                    <button
                      onClick={() => onDelete(attachment.id)}
                      className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
                      title={t('oscrat.ui.delete')}
                    >
                      <FaTrashAlt size={14} />
                      <span className="text-xs">{t('oscrat.ui.delete')}</span>
                    </button>
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

export default Table;
