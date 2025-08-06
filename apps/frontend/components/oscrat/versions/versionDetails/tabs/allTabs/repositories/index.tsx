import { useState } from 'react';
import Table from './table';
import Modal from './modal';

// TODO: Wait for BE implementation and seed data
export default function Index() {
  const [isModalOpen, setModalOpen] = useState(false);

  // --- TYPE DEFINITIONS ---
  interface RepositoryData {
    id: string;
    name: string;
    provider: string;
    link: string;
  }

  const initialRepoData: RepositoryData[] = [
    {
      id: '1',
      name: 'v2.3',
      provider: 'GitHub',
      link: 'https://github.com/username/repository-name',
    },
  ];

  const [repositories, setRepositories] =
    useState<RepositoryData[]>(initialRepoData);

  const handleAddRepository = (newRepo: Omit<RepositoryData, 'id'>) => {
    const newEntry = { ...newRepo, id: (repositories.length + 2).toString() };
    setRepositories((prevRepos) => [...prevRepos, newEntry]);
  };

  const handleEdit = (id: string) =>
    alert(`Edit action for item ${id} is not yet implemented.`);
  const handleDelete = (id: string) =>
    alert(`Delete action for item ${id} is not yet implemented.`);

  return (
    <div className="flex w-full flex-col items-center rounded-lg border border-gray-400 p-4">
      <Table
        repositories={repositories}
        onAddNew={() => setModalOpen(true)}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        onAdd={handleAddRepository}
      />
    </div>
  );
}
