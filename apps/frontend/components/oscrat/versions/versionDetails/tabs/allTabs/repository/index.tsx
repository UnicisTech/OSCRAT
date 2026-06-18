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
  Lock,
} from 'lucide-react';
import {
  OscratRepositoryProvider,
  OscratRepositoryAuthType,
} from '@oscrat/model';
import { useVersionContext } from '@/context/VersionContext';
import { useOscratRepository } from '@/hooks/oscrat/useOscratRepository';
import { Divider } from '@/components/shared';
import Button from '@/components/button';
import {
  TabHeader,
  TabActionButton,
} from '@/components/oscrat/versions/versionDetails/tabs/allTabs/shared';
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
      <div className="border-line bg-surface rounded-card flex w-full flex-col items-center border p-6">
        <div className="flex justify-center p-8">
          <div className="text-content-muted text-sm">
            Loading repository...
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="border-line bg-surface rounded-card flex w-full flex-col items-center border p-6">
        <div className="flex justify-center p-8">
          <div className="text-danger text-sm">
            Error loading repository: {error?.message}
          </div>
        </div>
      </div>
    );
  }

  // If no repository exists, show warning message and add button
  if (!repository) {
    return (
      <div className="border-line bg-surface rounded-card flex w-full flex-col items-center border p-4">
        <div className="w-full">
          <TabHeader title={t('oscrat.ui.repository.labels.title')}>
            <TabActionButton onClick={handleAddRepository} disabled={isLoading}>
              {t('add-new')}
            </TabActionButton>
          </TabHeader>

          {/* Warning message */}
          <div className="flex items-center gap-4 py-8">
            <div className="flex items-center">
              <AlertTriangle className="text-warning mr-3 h-6 w-6" />
              <p className="text-content-secondary text-sm">
                {t('oscrat.ui.no-repo-defined')}
              </p>
            </div>
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
    <div className="border-line bg-surface rounded-card flex w-full flex-col items-center border p-4">
      <div className="w-full">
        <TabHeader title="Repository">
          <TabActionButton onClick={() => handleEdit()} disabled={isLoading}>
            {t('edit')}
          </TabActionButton>
          <Button
            variant="tertiary"
            tone="danger"
            size="m"
            onClick={() => handleDelete(repository.id)}
            disabled={isLoading}
            text={t('delete')}
          />
        </TabHeader>

        {/* Repository Information Section */}
        <div className="px-6 py-4">
          <h3 className="text-content-secondary mb-4 text-sm font-semibold">
            {t('oscrat.ui.repository.sections.information')}
          </h3>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="text-content-muted mb-1 block text-xs font-medium">
                {t('oscrat.ui.repository.labels.repository-name')}
              </label>
              <p className="text-content text-sm">{repository.name}</p>
            </div>

            <div>
              <label className="text-content-muted mb-1 block text-xs font-medium">
                {t('oscrat.ui.repository.labels.provider')}
              </label>
              <p className="text-content text-sm">
                {t(`oscrat.ui.repository.providers.${repository.provider}`)}
              </p>
            </div>

            <div>
              <label className="text-content-muted mb-1 block text-xs font-medium">
                {t('oscrat.ui.repository.labels.user-organization')}
              </label>
              <div className="flex items-center">
                <User className="text-content-placeholder mr-2 h-4 w-4" />
                <p className="text-content text-sm">{repository.user}</p>
              </div>
            </div>

            <div>
              <label className="text-content-muted mb-1 block text-xs font-medium">
                {t('oscrat.ui.repository.labels.repository-url')}
              </label>
              <div className="flex items-center">
                <Globe className="text-content-placeholder mr-2 h-4 w-4" />
                <Link
                  href={repository.repositoryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary-dark flex items-center text-sm hover:underline"
                >
                  {repository.repositoryUrl}
                  <ExternalLink className="ml-1 h-3 w-3" />
                </Link>
              </div>
            </div>

            <div>
              <label className="text-content-muted mb-1 block text-xs font-medium">
                {t('oscrat.ui.repository.labels.auth-type')}
              </label>
              <div className="flex items-center">
                {repository.authType === OscratRepositoryAuthType.PUBLIC ? (
                  <Globe className="text-content-placeholder mr-2 h-4 w-4" />
                ) : (
                  <Lock className="text-content-placeholder mr-2 h-4 w-4" />
                )}
                <p className="text-content text-sm">
                  {repository.authType === OscratRepositoryAuthType.PUBLIC
                    ? t('oscrat.ui.repository.labels.auth-public')
                    : t('oscrat.ui.repository.labels.auth-token')}
                </p>
              </div>
            </div>
          </div>
        </div>

        <Divider />

        {/* Target Configuration Section */}
        <div className="px-6 py-4">
          <div className="mb-4">
            <h3 className="text-content-secondary text-sm font-semibold">
              {t('oscrat.ui.repository.sections.target-configuration')}
            </h3>
            <p className="text-content-muted mt-1 text-xs">
              {t('oscrat.ui.repository.sections.target-configuration-help')}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="text-content-muted mb-1 block text-xs font-medium">
                {t('oscrat.ui.repository.labels.target-branch')}
              </label>
              <div className="flex items-center">
                <GitBranch className="text-content-placeholder mr-2 h-4 w-4" />
                <p className="text-content text-sm">
                  {repository.targetBranch || (
                    <span className="text-content-placeholder italic">
                      Not specified
                    </span>
                  )}
                </p>
              </div>
            </div>

            <div>
              <label className="text-content-muted mb-1 block text-xs font-medium">
                {t('oscrat.ui.repository.labels.target-tag')}
              </label>
              <div className="flex items-center">
                <Tag className="text-content-placeholder mr-2 h-4 w-4" />
                <p className="text-content text-sm">
                  {repository.targetTag || (
                    <span className="text-content-placeholder italic">
                      Not specified
                    </span>
                  )}
                </p>
              </div>
            </div>

            <div>
              <label className="text-content-muted mb-1 block text-xs font-medium">
                {t('oscrat.ui.repository.labels.target-commit')}
              </label>
              <div className="flex items-center">
                <GitCommit className="text-content-placeholder mr-2 h-4 w-4" />
                <p className="text-content text-sm">
                  {repository.targetCommit || (
                    <span className="text-content-placeholder italic">
                      Not specified
                    </span>
                  )}
                </p>
              </div>
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
