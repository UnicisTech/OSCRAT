import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { useTranslation } from 'next-i18next';
import toast from 'react-hot-toast';
import { Edit, GitBranch, ExternalLink, Trash2 } from 'lucide-react';
import { useTeamContext } from '@/context/TeamContext';
import { useOscratRepository } from '@/hooks/oscrat/useOscratRepository';
import EditRepository from './EditRepository';
import Button from '@/components/button';
import type { OscratRepositoryDetail } from '@oscrat/model';
import { formatDateShort } from '@/utils/dateFormat';

const RepositorySection = () => {
  const { t } = useTranslation('common');
  const params = useParams();
  const productId = params?.productId as string;
  const versionId = params?.versionId as string;
  const { slug } = useTeamContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateMode, setIsCreateMode] = useState(false);

  const { repository, isLoading, isError, error, deleteRepository } =
    useOscratRepository(slug, productId, versionId);

  const handleEditRepository = () => {
    setIsCreateMode(false);
    setIsModalOpen(true);
  };

  const handleAddRepository = () => {
    setIsCreateMode(true);
    setIsModalOpen(true);
  };

  const handleDeleteRepository = async () => {
    if (!repository) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete the repository "${repository.name}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      await deleteRepository();
      toast.success('Repository deleted successfully');
    } catch (error: any) {
      toast.error(`Failed to delete repository: ${error.message}`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <div className="text-content-muted text-sm">Loading repository...</div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex justify-center p-8">
        <div className="text-danger text-sm">
          Error loading repository: {error?.message}
        </div>
      </div>
    );
  }

  if (!repository) {
    return (
      <>
        <div className="flex justify-center p-8">
          <div className="text-center">
            <div className="text-content-muted mb-4 text-sm">
              No repository configured for this project.
            </div>
            <Button
              type="button"
              variant="primary"
              onClick={handleAddRepository}
            >
              Add Repository
            </Button>
          </div>
        </div>

        {isCreateMode && (
          <EditRepository
            visible={isModalOpen}
            setVisible={setIsModalOpen}
            repository={undefined}
            teamId={slug}
            productId={productId}
            versionId={versionId}
            isCreateMode={isCreateMode}
          />
        )}
      </>
    );
  }

  return (
    <div className="w-full p-4 pl-0 font-sans">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-content text-lg font-semibold">
          Repository Configuration
        </h3>
        <div className="flex space-x-2">
          <Button
            type="button"
            variant="secondary"
            size="m"
            onClick={handleEditRepository}
            startIcon={<Edit size={16} />}
          >
            Edit Repository
          </Button>
          <Button
            type="button"
            variant="secondary"
            tone="danger"
            size="m"
            onClick={handleDeleteRepository}
            startIcon={<Trash2 size={16} />}
          >
            Delete Repository
          </Button>
        </div>
      </div>

      <div className="bg-surface border-line rounded-card overflow-hidden border">
        <div className="p-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <dt className="text-content-muted text-sm font-medium">
                {t('oscrat.ui.repository.labels.repository-name')}
              </dt>
              <dd className="text-content mt-1 text-sm font-semibold">
                {repository.name}
              </dd>
            </div>

            <div>
              <dt className="text-content-muted text-sm font-medium">
                Provider
              </dt>
              <dd className="text-content mt-1 text-sm font-semibold">
                {repository.provider}
              </dd>
            </div>

            <div>
              <dt className="text-content-muted text-sm font-medium">User</dt>
              <dd className="text-content mt-1 text-sm font-semibold">
                {repository.user}
              </dd>
            </div>

            <div>
              <dt className="text-content-muted text-sm font-medium">
                Repository URL
              </dt>
              <dd className="text-content mt-1 flex items-center text-sm font-semibold">
                <a
                  href={repository.repositoryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary-dark inline-flex items-center"
                >
                  {repository.repositoryUrl}
                  <ExternalLink size={14} className="ml-1" />
                </a>
              </dd>
            </div>

            {repository.targetBranch && (
              <div>
                <dt className="text-content-muted text-sm font-medium">
                  Target Branch
                </dt>
                <dd className="text-content mt-1 flex items-center text-sm font-semibold">
                  <GitBranch size={14} className="mr-1" />
                  {repository.targetBranch}
                </dd>
              </div>
            )}

            {repository.targetTag && (
              <div>
                <dt className="text-content-muted text-sm font-medium">
                  Target Tag
                </dt>
                <dd className="text-content mt-1 text-sm font-semibold">
                  {repository.targetTag}
                </dd>
              </div>
            )}

            {repository.targetCommit && (
              <div>
                <dt className="text-content-muted text-sm font-medium">
                  Target Commit
                </dt>
                <dd className="text-content mt-1 truncate text-sm font-semibold">
                  {repository.targetCommit}
                </dd>
              </div>
            )}

            <div>
              <dt className="text-content-muted text-sm font-medium">
                Created
              </dt>
              <dd className="text-content mt-1 text-sm font-semibold">
                {formatDateShort(repository.createdAt)}
              </dd>
            </div>

            <div>
              <dt className="text-content-muted text-sm font-medium">
                Last Updated
              </dt>
              <dd className="text-content mt-1 text-sm font-semibold">
                {formatDateShort(repository.updatedAt)}
              </dd>
            </div>
          </div>
        </div>
      </div>

      {(repository || isCreateMode) && (
        <EditRepository
          visible={isModalOpen}
          setVisible={setIsModalOpen}
          repository={repository as OscratRepositoryDetail}
          teamId={slug}
          productId={productId}
          versionId={versionId}
          isCreateMode={isCreateMode}
        />
      )}
    </div>
  );
};

export default RepositorySection;
