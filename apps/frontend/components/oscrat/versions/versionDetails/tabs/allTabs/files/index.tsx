import AddFileModal from '@/components/oscrat/versions/versionDetails/tabs/allTabs/files/modal';
import FileTable from '@/components/oscrat/versions/versionDetails/tabs/allTabs/files/fileTable';
import { useState, useMemo } from 'react';
import { useVersionContext } from '@/context/VersionContext';
import { useVersionAttachments } from '@/hooks/oscrat/useVersionAttachments';
import toast from 'react-hot-toast';
import { extractErrorMessage } from '@/lib/utils';
import type { Attachment } from '@/types';

export default function Files() {
  const [isAddModalOpen, setAddModalOpen] = useState(false);
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
    try {
      await downloadAttachment(fileId, filename);
    } catch (error: unknown) {
      toast.error(extractErrorMessage(error, 'Failed to download attachment'));
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
      <div className="flex w-full flex-col items-center py-8">
        <div>Loading attachments...</div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex w-full flex-col items-center py-8">
        <div>Error loading attachments: {error?.message}</div>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col items-center py-8">
      <FileTable
        attachments={attachments}
        onAddFileClick={() => setAddModalOpen(true)}
        onDownloadFile={handleDownloadFile}
        onDeleteFile={handleDeleteFile}
      />

      <AddFileModal
        isOpen={isAddModalOpen}
        onClose={() => setAddModalOpen(false)}
        onAddFile={handleAddNewFile}
      />
    </div>
  );
}
