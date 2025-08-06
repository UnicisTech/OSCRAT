import AddFileModal from '@/components/oscrat/versions/versionDetails/tabs/allTabs/files/modal';
import FileTable from '@/components/oscrat/versions/versionDetails/tabs/allTabs/files/fileTable';
import { useState } from 'react';

export default function Files() {
  const [isAddModalOpen, setAddModalOpen] = useState(false);

  // TODO: Align with Radu to implement
  // Mock data for the file table
  const initialFiles: FileData[] = [
    {
      id: '1',
      name: 'ENISA Assessment 2.31/2005',
      type: 'CAB Assessment',
      version: '1.0',
      dateAdded: '01.01.2025',
      addedBy: 'Emily Carter',
      lastEdited: '01.01.2025',
      editedBy: 'Emily Carter',
    },
    {
      id: '2',
      name: 'Manual Bx3',
      type: 'User manual',
      version: '2.36',
      dateAdded: '01.01.2025',
      addedBy: 'Emily Carter',
      lastEdited: '01.01.2025',
      editedBy: 'Emily Carter',
    },
    {
      id: '3',
      name: 'SSM 3.56/2025',
      type: 'SBOM',
      version: '4.5',
      dateAdded: '01.01.2025',
      addedBy: 'Ravi Patel',
      lastEdited: '01.01.2025',
      editedBy: 'Emily Carter',
    },
    {
      id: '4',
      name: 'Connection B PLane',
      type: 'Technical Documentation',
      version: '1.2',
      dateAdded: '01.01.2025',
      addedBy: 'Emily Carter',
      lastEdited: '01.01.2025',
      editedBy: 'Emily Carter',
    },
    {
      id: '5',
      name: 'Production PXC',
      type: 'Other',
      version: '1.6',
      dateAdded: '01.01.2025',
      addedBy: 'Ravi Patel',
      lastEdited: '01.01.2025',
      editedBy: 'Emily Carter',
    },
  ];

  interface FileData {
    id: string;
    name: string;
    type: string;
    version: string;
    dateAdded: string;
    addedBy: string;
    lastEdited: string;
    editedBy: string;
  }

  const [files, setFiles] = useState<FileData[]>(initialFiles);

  // Handler to add a new file to the state
  const handleAddNewFile = (
    newFileData: Omit<FileData, 'id' | 'dateAdded' | 'lastEdited'>
  ) => {
    const newFile: FileData = {
      ...newFileData,
      id: (files.length + 1).toString(), // Simple ID generation
      dateAdded: new Date().toLocaleDateString('en-GB'),
      lastEdited: new Date().toLocaleDateString('en-GB'),
    };
    setFiles((prevFiles) => [...prevFiles, newFile]);
  };

  return (
    <div className="flex w-full flex-col items-center py-8">
      <FileTable files={files} onAddFileClick={() => setAddModalOpen(true)} />

      <AddFileModal
        isOpen={isAddModalOpen}
        onClose={() => setAddModalOpen(false)}
        onAddFile={handleAddNewFile}
      />
    </div>
  );
}
