import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { useTranslation } from 'next-i18next';
import toast from 'react-hot-toast';
import { Edit, GitBranch, ExternalLink, Trash2 } from 'lucide-react';
import { useTeamContext } from '@/context/TeamContext';
import { useOscratRepository } from '@/hooks/oscrat/useOscratRepository';
import EditRepository from './EditRepository';
import type { OscratRepositoryDetail } from '@oscrat/model';

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
        <div className="text-sm text-gray-500">Loading repository...</div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex justify-center p-8">
        <div className="text-sm text-red-500">
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
            <div className="mb-4 text-sm text-gray-500">
              No repository configured for this project.
            </div>
            <button
              type="button"
              onClick={handleAddRepository}
              className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Add Repository
            </button>
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
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Repository Configuration
        </h3>
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={handleEditRepository}
            className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            <Edit size={16} className="mr-2" />
            Edit Repository
          </button>
          <button
            type="button"
            onClick={handleDeleteRepository}
            className="inline-flex items-center rounded-md border border-red-300 bg-white px-3 py-2 text-sm font-medium text-red-700 shadow-sm hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:border-red-600 dark:bg-gray-800 dark:text-red-400 dark:hover:bg-red-900/20"
          >
            <Trash2 size={16} className="mr-2" />
            Delete Repository
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg bg-white shadow-md dark:bg-gray-800">
        <div className="p-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Repository Name
              </dt>
              <dd className="mt-1 text-sm font-semibold text-gray-900 dark:text-gray-100">
                {repository.name}
              </dd>
            </div>

            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Provider
              </dt>
              <dd className="mt-1 text-sm font-semibold text-gray-900 dark:text-gray-100">
                {repository.provider}
              </dd>
            </div>

            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                User
              </dt>
              <dd className="mt-1 text-sm font-semibold text-gray-900 dark:text-gray-100">
                {repository.user}
              </dd>
            </div>

            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Repository URL
              </dt>
              <dd className="mt-1 flex items-center text-sm font-semibold text-gray-900 dark:text-gray-100">
                <a
                  href={repository.repositoryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  {repository.repositoryUrl}
                  <ExternalLink size={14} className="ml-1" />
                </a>
              </dd>
            </div>

            {repository.targetBranch && (
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Target Branch
                </dt>
                <dd className="mt-1 flex items-center text-sm font-semibold text-gray-900 dark:text-gray-100">
                  <GitBranch size={14} className="mr-1" />
                  {repository.targetBranch}
                </dd>
              </div>
            )}

            {repository.targetTag && (
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Target Tag
                </dt>
                <dd className="mt-1 text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {repository.targetTag}
                </dd>
              </div>
            )}

            {repository.targetCommit && (
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Target Commit
                </dt>
                <dd className="mt-1 truncate text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {repository.targetCommit}
                </dd>
              </div>
            )}

            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Created
              </dt>
              <dd className="mt-1 text-sm font-semibold text-gray-900 dark:text-gray-100">
                {new Date(repository.createdAt).toLocaleDateString()}
              </dd>
            </div>

            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Last Updated
              </dt>
              <dd className="mt-1 text-sm font-semibold text-gray-900 dark:text-gray-100">
                {new Date(repository.updatedAt).toLocaleDateString()}
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
