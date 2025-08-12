import React from 'react';
import { FaPencilAlt, FaTrashAlt } from 'react-icons/fa';
import { ExternalLink } from 'lucide-react';
import { useTranslation } from 'next-i18next';
import type { OscratRepositoryDetail } from '@oscrat/model';

interface RepositoryTableProps {
  repositories: OscratRepositoryDetail[];
  onAddNew: () => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  isLoading?: boolean;
}

const Table: React.FC<RepositoryTableProps> = ({
  repositories,
  onAddNew,
  onEdit,
  onDelete,
  isLoading = false,
}) => {
  const tableHeaders = ['Name', 'Provider', 'Link', ''];
  const { t, ready } = useTranslation('common');

  if (!ready) {
    return null;
  }

  return (
    <div className="w-full rounded-lg bg-white">
      {/* Only show Add New button when no repositories exist */}
      {repositories.length === 0 && (
        <div className="mb-4">
          <button
            onClick={onAddNew}
            disabled={isLoading}
            className="rounded-sm border border-gray-400 bg-white px-2 py-1 text-[14px] font-medium text-gray-900 hover:bg-gray-50 disabled:opacity-50"
          >
            {t('add-new')}
          </button>
        </div>
      )}

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
            {repositories.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center">
                  <p className="text-sm text-gray-900">
                    {t('oscrat.ui.no-repo-defined')}
                  </p>
                </td>
              </tr>
            ) : (
              repositories.map((repo) => (
                <tr
                  key={repo.id}
                  className="border-t bg-white hover:bg-gray-50"
                >
                  <td className="px-6 py-4 text-gray-900">{repo.name}</td>
                  <td className="px-6 py-4 text-gray-900">{repo.provider}</td>
                  <td className="max-w-xs truncate px-6 py-4 text-gray-900">
                    <a
                      href={repo.repositoryUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-blue-600 hover:text-blue-800"
                    >
                      {repo.repositoryUrl}
                      <ExternalLink size={14} className="ml-1" />
                    </a>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-4">
                      <button
                        onClick={() => onEdit(repo.id)}
                        disabled={isLoading}
                        className="text-gray-700 hover:text-blue-600 disabled:opacity-50"
                      >
                        <FaPencilAlt />
                      </button>
                      <button
                        onClick={() => onDelete(repo.id)}
                        disabled={isLoading}
                        className="text-gray-700 hover:text-red-600 disabled:opacity-50"
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
