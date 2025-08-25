import React from 'react';
import { AlertTriangle } from 'lucide-react';
import Link from 'next/link';
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

  // If no repositories exist, show warning message and add button only
  if (repositories.length === 0) {
    return (
      <div className="w-full rounded-lg bg-white px-4">
        <div className="flex items-center gap-4">
          {/* Add New button */}
          <button
            onClick={onAddNew}
            disabled={isLoading}
            className="rounded-md border border-gray-400 bg-white px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50 disabled:opacity-50"
          >
            {t('add-new')}
          </button>

          {/* Warning icon and message */}
          <div className="flex items-center">
            <AlertTriangle className="mr-2 h-5 w-5 text-yellow-600" />
            <p className="text-sm text-gray-700">
              {t('oscrat.ui.no-repo-defined')}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show table when repositories exist
  return (
    <div className="w-full rounded-lg bg-white">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm font-semibold text-gray-600">
          <thead className="bg-white text-xs text-gray-500">
            <tr>
              {tableHeaders.map((header) => (
                <th
                  key={header}
                  scope="col"
                  className="bg-white px-6 font-normal"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {repositories.map((repo) => (
              <tr key={repo.id} className="bg-white hover:bg-gray-50">
                <td className="bg-white px-6 py-2 text-gray-900">
                  {repo.name}
                </td>
                <td className="bg-white px-6 py-2 text-gray-900">
                  {repo.provider}
                </td>
                <td className="max-w-xs truncate bg-white px-6 py-2 text-gray-900">
                  <Link
                    href={repo.repositoryUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {repo.repositoryUrl}
                  </Link>
                </td>
                <td className="bg-white px-6 py-2 text-right">
                  <div className="flex items-center justify-end space-x-4">
                    <button
                      onClick={() => onEdit(repo.id)}
                      disabled={isLoading}
                      className="rounded border border-gray-400 px-3 py-1 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                    >
                      {t('edit')}
                    </button>
                    <button
                      onClick={() => onDelete(repo.id)}
                      disabled={isLoading}
                      className="px-3 py-1 text-sm text-gray-500 hover:text-red-600 disabled:opacity-50"
                    >
                      {t('delete')}
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
