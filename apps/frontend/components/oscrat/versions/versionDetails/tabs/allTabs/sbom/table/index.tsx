import React from 'react';
import { FaTrashAlt } from 'react-icons/fa';
import { useTranslation } from 'next-i18next';

// --- TYPE DEFINITIONS ---
interface SbomData {
  id: string;
  name: string;
  status: 'Active' | 'Archived';
  dateAdded: string;
  addedBy: string;
  lastVerified: string;
  verifiedBy: string;
}

interface SsmTableProps {
  sbomData: SbomData[];
  onImportClick: () => void;
  onGenerate: () => void;
  onValidate: (id: string) => void;
  onDelete: (id: string) => void;
}

const Table: React.FC<SsmTableProps> = ({
  sbomData,
  onImportClick,
  onGenerate,
  onValidate,
  onDelete,
}) => {
  // Mock context variables to simulate repository and generation status
  const hasRepositoryDefined = true;
  const isSbomGenerating = false;

  const { t, ready } = useTranslation('common');

  if (!ready) {
    return null;
  }

  const tableHeaders = [
    'Name',
    'Status',
    'Dated Added',
    'Added by',
    'Last Verified',
    'Verified by',
    '',
  ];

  const StatusPill: React.FC<{ status: 'Active' | 'Archived' }> = ({
    status,
  }) => {
    const isActive = status === 'Active';
    const pillClasses = isActive
      ? 'bg-green-100 text-green-800'
      : 'bg-gray-100 text-gray-800';
    return (
      <span
        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${pillClasses}`}
      >
        {status}
      </span>
    );
  };

  return (
    <div className="bg- w-full rounded-lg">
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
        {!hasRepositoryDefined && (
          <div className="flex items-center text-sm text-red-600">
            <span className="mr-1">⚠️</span>
            <span>{t('to-generate-sbom')}</span>
          </div>
        )}
        {hasRepositoryDefined && isSbomGenerating && (
          <div className="flex items-center text-sm text-yellow-600">
            <span className="mr-1">⚠️</span>
            <span> {t('generate')}</span>
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
          <tbody>
            {sbomData.length === 0 ? (
              <tr>
                <td
                  colSpan={tableHeaders.length}
                  className="px-6 py-12 text-center text-gray-500"
                >
                  {t('oscrat.ui.no-sbom-added')}
                </td>
              </tr>
            ) : (
              sbomData.map((item) => (
                <tr
                  key={item.id}
                  className="border-b bg-white hover:bg-gray-50"
                >
                  <td className="whitespace-nowrap px-6 py-4 font-medium text-gray-900">
                    {item.name}
                  </td>
                  <td className="px-6 py-4">
                    <StatusPill status={item.status} />
                  </td>
                  <td className="px-6 py-4">{item.dateAdded}</td>
                  <td className="px-6 py-4">{item.addedBy}</td>
                  <td className="px-6 py-4">{item.lastVerified}</td>
                  <td className="px-6 py-4">{item.verifiedBy}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-4">
                      {item.status === 'Active' && (
                        <button
                          onClick={() => onValidate(item.id)}
                          className="rounded-md border border-gray-300 bg-white px-3 py-1 text-xs font-medium text-gray-900 hover:bg-gray-50"
                        >
                          {t('validate')}
                        </button>
                      )}
                      <button
                        onClick={() => onDelete(item.id)}
                        className="text-gray-400 hover:text-red-600"
                      >
                        <FaTrashAlt />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Table;
