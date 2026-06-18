import AddFileModal from '@/components/oscrat/versions/versionDetails/tabs/allTabs/files/modal';
import FileTable from '@/components/oscrat/versions/versionDetails/tabs/allTabs/files/fileTable';
import { useState } from 'react';
import { useVersionContext } from '@/context/VersionContext';
import { useVersionAttachments } from '@/hooks/oscrat/useVersionAttachments';
import toast from 'react-hot-toast';
import { extractErrorMessage } from '@/lib/utils';

export default function Files() {
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [downloadingFiles, setDownloadingFiles] = useState<Set<string>>(
    new Set()
  );
  const { teamId, productId, versionId } = useVersionContext();

  const {
    attachments,
    isLoading,
    isError,
    error,
    uploadAttachment,
    downloadAttachment,
    deleteAttachment,
  } = useVersionAttachments(teamId, productId, versionId);

  // Use attachments directly - no transformation needed

  // Handler to add a new file
  const handleAddNewFile = async (file: File, description?: string) => {
    try {
      await uploadAttachment(file, description);
      toast.success('File uploaded successfully');
    } catch (error: unknown) {
      toast.error(extractErrorMessage(error, 'Failed to upload attachment'));
    }
  };

  const handleDownloadFile = async (fileId: string, filename: string) => {
    setDownloadingFiles((prev) => new Set(prev).add(fileId));
    try {
      await downloadAttachment(fileId, filename);
      toast.success('Download will start shortly');
    } catch (error: unknown) {
      toast.error(extractErrorMessage(error, 'Failed to download attachment'));
    } finally {
      setDownloadingFiles((prev) => {
        const newSet = new Set(prev);
        newSet.delete(fileId);
        return newSet;
      });
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    try {
      await deleteAttachment(fileId);
      toast.success('File deleted successfully');
    } catch (error: unknown) {
      toast.error(extractErrorMessage(error, 'Failed to delete attachment'));
    }
  };

  if (isLoading) {
    return (
      <div className="flex w-full flex-col items-center">
        <div>Loading attachments...</div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex w-full flex-col items-center">
        <div>Error loading attachments: {error?.message}</div>
      </div>
    );
  }

  return (
    <div className="border-line bg-surface rounded-card flex w-full flex-col items-center border p-4">
      <div className="w-full">
        <FileTable
          attachments={attachments}
          onAddFileClick={() => setAddModalOpen(true)}
          onDownloadFile={handleDownloadFile}
          onDeleteFile={handleDeleteFile}
          downloadingFiles={downloadingFiles}
        />
      </div>

      <AddFileModal
        isOpen={isAddModalOpen}
        onClose={() => setAddModalOpen(false)}
        onAddFile={handleAddNewFile}
      />
    </div>
  );
}
