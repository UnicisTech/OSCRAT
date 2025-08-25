import ImportModal from '@/components/oscrat/versions/versionDetails/tabs/allTabs/sbom/modal';
import Table from '@/components/oscrat/versions/versionDetails/tabs/allTabs/sbom/table';
import { useOscratRepository } from '@/hooks/oscrat/useOscratRepository';
import { useOscratVersionSbomJobs } from '@/hooks/oscrat/useOscratJobs';
import { useVersionAttachments } from '@/hooks/oscrat/useVersionAttachments';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useProductContext } from '@/context/ProductContext';
import { useVersionContext } from '@/context/VersionContext';
import { useTeamContext } from '@/context/TeamContext';
import { extractErrorMessage } from '@/lib/utils';

export default function Sbom() {
  const [isImportModalOpen, setImportModalOpen] = useState(false);
  const { slug: teamId } = useTeamContext();
  const { productId } = useProductContext();
  const { versionId } = useVersionContext();

  const { repository } = useOscratRepository(teamId, productId, versionId);

  const {
    jobs,
    createSbomJob,
    isLoading: isCreatingJob,
  } = useOscratVersionSbomJobs(teamId, productId, versionId);

  const {
    attachments,
    isLoading: isLoadingAttachments,
    uploadAttachment,
    downloadAttachment,
    deleteAttachment,
  } = useVersionAttachments(teamId, productId, versionId);

  const handleCreateSbomJob = async () => {
    if (!repository?.id) {
      toast.error('No repository configured for this project');
      return;
    }

    try {
      await createSbomJob({ repositoryId: repository.id });
      toast.success('SBOM job created successfully');
    } catch (error: unknown) {
      toast.error(
        `Failed to create SBOM job: ${extractErrorMessage(error, 'Failed to create SBOM job')}`
      );
    }
  };

  const handleFileImport = async (file: File, description?: string) => {
    try {
      await uploadAttachment(file, description);
      toast.success(`SBOM file "${file.name}" uploaded successfully!`);
    } catch (error: unknown) {
      toast.error(extractErrorMessage(error, 'Failed to upload SBOM file'));
    }
  };

  const handleGenerate = () => handleCreateSbomJob();

  const handleValidate = (id: string) => {
    // TODO: Implement SBOM validation functionality
    toast.success(
      `Validate action for SBOM ${id}. Functionality not yet implemented.`
    );
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteAttachment(id);
      toast.success('SBOM file deleted successfully');
    } catch (error: unknown) {
      toast.error(extractErrorMessage(error, 'Failed to delete SBOM file'));
    }
  };

  const handleDownload = async (id: string, filename: string) => {
    try {
      await downloadAttachment(id, filename);
      toast.success('Download will start shortly');
    } catch (error: unknown) {
      toast.error(extractErrorMessage(error, 'Failed to download SBOM file'));
    }
  };

  return (
    <div className="flex w-full flex-col items-center rounded-lg border border-gray-400 bg-white p-4">
      <div className="w-full">
        <Table
          sbomData={attachments}
          onImportClick={() => setImportModalOpen(true)}
          onGenerate={handleGenerate}
          onValidate={handleValidate}
          onDelete={handleDelete}
          onDownload={handleDownload}
          isLoading={isLoadingAttachments || isCreatingJob}
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
