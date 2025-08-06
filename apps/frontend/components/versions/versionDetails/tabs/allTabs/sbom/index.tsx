import ImportModal from '@/components/versions/versionDetails/tabs/allTabs/sbom/modal';
import Table from '@/components/versions/versionDetails/tabs/allTabs/sbom/table';
import { useState } from 'react';

interface SbomData {
  id: string;
  name: string;
  status: 'Active' | 'Archived';
  dateAdded: string;
  addedBy: string;
  lastVerified: string;
  verifiedBy: string;
}

export default function Sbom() {
  const [isImportModalOpen, setImportModalOpen] = useState(false);

  // TODO: Align with Radu to be added to seed after specs are done
  const initialSbomData: SbomData[] = [
    {
      id: '1',
      name: 'SSM 3.56/2025',
      status: 'Active',
      dateAdded: '01.01.2025',
      addedBy: 'Ravi Patel',
      lastVerified: '-',
      verifiedBy: '-',
    },
    {
      id: '2',
      name: 'SSM 3.2/2025',
      status: 'Archived',
      dateAdded: '01.01.2025',
      addedBy: 'Ravi Patel',
      lastVerified: '-',
      verifiedBy: '-',
    },
    {
      id: '3',
      name: 'SSM 3.12/2025',
      status: 'Archived',
      dateAdded: '01.01.2025',
      addedBy: 'Ravi Patel',
      lastVerified: '01.01.2025',
      verifiedBy: 'Emily Carter',
    },
  ];
  const [sbomData, setSbomData] = useState<SbomData[]>(initialSbomData);

  const handleFileImport = (name: string, file: File) => {
    console.log('Importing file:', file.name, 'with SSM name:', name);
    const newSbomEntry: SbomData = {
      id: (sbomData.length + 2).toString(),
      name,
      status: 'Active',
      dateAdded: new Date().toLocaleDateString('en-GB'),
      addedBy: 'Current User',
      lastVerified: '-',
      verifiedBy: '-',
    };
    setSbomData((prevData) => [...prevData, newSbomEntry]);
    alert(`File "${file.name}" imported as "${name}" successfully!`);
  };

  const handleGenerate = () =>
    alert('Generate button clicked. Functionality not yet implemented.');
  const handleValidate = (id: string) =>
    alert(`Validate action for item ${id}. Functionality not yet implemented.`);
  const handleDelete = (id: string) =>
    alert(`Delete action for item ${id}. Functionality not yet implemented.`);

  return (
    <div className="flex w-full flex-col items-center rounded-lg border border-gray-400 bg-white p-4">
      <div className="w-full">
        <Table
          sbomData={sbomData}
          onImportClick={() => setImportModalOpen(true)}
          onGenerate={handleGenerate}
          onValidate={handleValidate}
          onDelete={handleDelete}
        />
      </div>

      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setImportModalOpen(false)}
        onImport={handleFileImport}
      />
    </div>
  );
}
