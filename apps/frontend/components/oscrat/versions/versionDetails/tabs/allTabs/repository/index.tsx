import { useState } from 'react';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import {
  AlertTriangle,
  ExternalLink,
  GitBranch,
  Tag,
  GitCommit,
  User,
  Globe,
} from 'lucide-react';
import { useVersionContext } from '@/context/VersionContext';
import { useOscratRepository } from '@/hooks/oscrat/useOscratRepository';
import { Divider } from '@/components/shared';
import Modal from './modal';
import ConfirmationModal from './confirmationModal';

export default function Repository() {
  const [isModalOpen, setModalOpen] = useState(false);
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [isConfirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [repositoryToDelete, setRepositoryToDelete] = useState<string | null>(
    null
  );
  const [isDeletingRepository, setIsDeletingRepository] = useState(false);

  const { teamId, productId, versionId } = useVersionContext();
  const { t } = useTranslation('common');

  const { repository, isLoading, isError, error, deleteRepository } =
    useOscratRepository(teamId, productId, versionId);

  const handleAddRepository = () => {
    setIsCreateMode(true);
    setModalOpen(true);
  };

  const handleEdit = () => {
    setIsCreateMode(false);
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    setRepositoryToDelete(id);
    setConfirmDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!repository || !repositoryToDelete) return;

    setIsDeletingRepository(true);
    try {
      await deleteRepository();
      setConfirmDeleteOpen(false);
      setRepositoryToDelete(null);
    } catch (error: any) {
      console.error('Failed to delete repository:', error.message);
    } finally {
      setIsDeletingRepository(false);
    }
  };

  const handleCancelDelete = () => {
    setConfirmDeleteOpen(false);
    setRepositoryToDelete(null);
  };

  if (isLoading) {
    return (
      <div className="flex w-full flex-col items-center rounded-lg border border-gray-400 p-6">
        <div className="flex justify-center p-8">
          <div className="text-sm text-gray-500">Loading repository...</div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex w-full flex-col items-center rounded-lg border border-gray-400 p-6">
        <div className="flex justify-center p-8">
          <div className="text-sm text-red-500">
            Error loading repository: {error?.message}
          </div>
        </div>
      </div>
    );
  }

  // If no repository exists, show warning message and add button
  if (!repository) {
    return (
      <div className="flex w-full flex-col rounded-lg border border-gray-400 bg-white">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {t('oscrat.ui.repository.labels.title')}
          </h2>
          <button
            onClick={handleAddRepository}
            disabled={isLoading}
            className="rounded-md border border-gray-400 bg-white px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50 disabled:opacity-50"
          >
            {t('add-new')}
          </button>
        </div>

        {/* Warning message */}
        <div className="flex items-center gap-4 px-6 py-8">
          <div className="flex items-center">
            <AlertTriangle className="mr-3 h-6 w-6 text-yellow-600" />
            <p className="text-sm text-gray-700">
              {t('oscrat.ui.no-repo-defined')}
            </p>
          </div>
        </div>

        <Modal
          isOpen={isModalOpen}
          onClose={() => setModalOpen(false)}
          repository={undefined}
          teamId={teamId}
          projectId={productId}
          versionId={versionId}
          isCreateMode={isCreateMode}
        />
      </div>
    );
  }

  // Show repository information when it exists
  return (
    <div className="flex w-full flex-col rounded-lg border border-gray-400 bg-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
        <h2 className="text-lg font-semibold text-gray-900">Repository</h2>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => handleEdit()}
            disabled={isLoading}
            className="rounded border border-gray-400 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            {t('edit')}
          </button>
          <button
            onClick={() => handleDelete(repository.id)}
            disabled={isLoading}
            className="px-3 py-1.5 text-sm text-gray-500 hover:text-red-600 disabled:opacity-50"
          >
            {t('delete')}
          </button>
        </div>
      </div>

      {/* Repository Information Section */}
      <div className="px-6 py-4">
        <h3 className="mb-4 text-sm font-semibold text-gray-700">
          {t('oscrat.ui.repository.sections.information')}
        </h3>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">
              {t('oscrat.ui.repository.labels.repository-name')}
            </label>
            <p className="text-sm text-gray-900">{repository.name}</p>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">
              {t('oscrat.ui.repository.labels.provider')}
            </label>
            <p className="text-sm text-gray-900">{repository.provider}</p>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">
              {t('oscrat.ui.repository.labels.user-organization')}
            </label>
            <div className="flex items-center">
              <User className="mr-2 h-4 w-4 text-gray-400" />
              <p className="text-sm text-gray-900">{repository.user}</p>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">
              {t('oscrat.ui.repository.labels.repository-url')}
            </label>
            <div className="flex items-center">
              <Globe className="mr-2 h-4 w-4 text-gray-400" />
              <Link
                href={repository.repositoryUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-sm text-blue-600 hover:text-blue-800 hover:underline"
              >
                {repository.repositoryUrl}
                <ExternalLink className="ml-1 h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Divider />

      {/* Target Configuration Section */}
      <div className="px-6 py-4">
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-gray-700">
            {t('oscrat.ui.repository.sections.target-configuration')}
          </h3>
          <p className="mt-1 text-xs text-gray-500">
            {t('oscrat.ui.repository.sections.target-configuration-help')}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">
              {t('oscrat.ui.repository.labels.target-branch')}
            </label>
            <div className="flex items-center">
              <GitBranch className="mr-2 h-4 w-4 text-gray-400" />
              <p className="text-sm text-gray-900">
                {repository.targetBranch || (
                  <span className="italic text-gray-400">Not specified</span>
                )}
              </p>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">
              {t('oscrat.ui.repository.labels.target-tag')}
            </label>
            <div className="flex items-center">
              <Tag className="mr-2 h-4 w-4 text-gray-400" />
              <p className="text-sm text-gray-900">
                {repository.targetTag || (
                  <span className="italic text-gray-400">Not specified</span>
                )}
              </p>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">
              {t('oscrat.ui.repository.labels.target-commit')}
            </label>
            <div className="flex items-center">
              <GitCommit className="mr-2 h-4 w-4 text-gray-400" />
              <p className="text-sm text-gray-900">
                {repository.targetCommit || (
                  <span className="italic text-gray-400">Not specified</span>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        repository={!isCreateMode ? repository || undefined : undefined}
        teamId={teamId}
        projectId={productId}
        versionId={versionId}
        isCreateMode={isCreateMode}
      />

      <ConfirmationModal
        isOpen={isConfirmDeleteOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Delete Repository"
        message={`Are you sure you want to delete the repository "${repository?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        isLoading={isDeletingRepository}
        variant="danger"
      />
    </div>
  );
}
