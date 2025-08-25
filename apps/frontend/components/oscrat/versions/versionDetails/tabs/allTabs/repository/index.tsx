import { useState } from 'react';
import { useVersionContext } from '@/context/VersionContext';
import { useOscratRepository } from '@/hooks/oscrat/useOscratRepository';
import Table from './table';
import Modal from './modal';
import ConfirmationModal from './confirmationModal';

export default function Index() {
  const [isModalOpen, setModalOpen] = useState(false);
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [isConfirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [repositoryToDelete, setRepositoryToDelete] = useState<string | null>(
    null
  );
  const [isDeletingRepository, setIsDeletingRepository] = useState(false);

  const { teamId, productId, versionId } = useVersionContext();

  const { repository, isLoading, isError, error, deleteRepository } =
    useOscratRepository(teamId, productId, versionId);

  // Convert single repository to array format for table compatibility
  const repositories = repository ? [repository] : [];

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
      <div className="flex w-full flex-col items-center rounded-lg border border-gray-400 p-4">
        <div className="flex justify-center p-8">
          <div className="text-sm text-gray-500">Loading repository...</div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex w-full flex-col items-center rounded-lg border border-gray-400 p-4">
        <div className="flex justify-center p-8">
          <div className="text-sm text-red-500">
            Error loading repository: {error?.message}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col items-center rounded-lg border border-gray-400 py-3">
      <Table
        repositories={repositories}
        onAddNew={handleAddRepository}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isLoading={isLoading}
      />

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
