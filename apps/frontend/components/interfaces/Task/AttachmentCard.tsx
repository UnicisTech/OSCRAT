import React from 'react';
import { useTranslation } from 'next-i18next';
import { Attachment } from 'types';
import toast from 'react-hot-toast';
import { AccessControl } from '@/components/shared/AccessControl';
import { useTaskAttachments } from '@/hooks/useTaskAttachments';
import { extractErrorMessage } from '@/lib/utils';

type Props = {
  attachment: Attachment;
  taskNumber: string;
  teamSlug: string;
};

export default function AttachmentsCard({
  attachment,
  taskNumber,
  teamSlug,
}: Props) {
  const { t } = useTranslation('common');
  const { deleteAttachment } = useTaskAttachments(teamSlug, taskNumber);

  const handleDelete = async () => {
    try {
      await deleteAttachment(attachment.id);
      toast.success(t('attachment-deleted'));
    } catch (error: unknown) {
      toast.error(extractErrorMessage(error, t('attachment-delete-error')));
    }
  };

  return (
    <div className="flex w-full flex-row items-center justify-between rounded-md p-2 text-center">
      <a
        href={attachment.url || `/api/attachments/${attachment.id}/download`}
        target="_blank"
        rel="noreferrer"
      >
        <div className="flex items-center gap-2 text-sm">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`text-blue-700`}
          >
            <path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z" />
            <path d="M11 10a1 1 0 0 1 2 0v4a1 1 0 0 1-2 0v-4z" />
            <path d="M11 16a1 1 0 0 1 2 0v.01a1 1 0 0 1-2 0V16z" />
          </svg>
          <div className="flex flex-col">
            <p className="font-medium hover:underline">{attachment.name}</p>
            {attachment.description && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {attachment.description}
              </p>
            )}
            <p className="text-xs text-gray-400">
              {(attachment.fileSize / 1024).toFixed(1)} KB
              {attachment.mimeType && ` • ${attachment.mimeType}`}
            </p>
          </div>
        </div>
      </a>
      <AccessControl resource="task" actions={['update']}>
        <button
          className="flex items-center rounded p-1 text-red-500 hover:bg-gray-100"
          onClick={handleDelete}
          title={t('delete')}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 6h18" />
            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
            <line x1="10" y1="11" x2="10" y2="17" />
            <line x1="14" y1="11" x2="14" y2="17" />
          </svg>
        </button>
      </AccessControl>
    </div>
  );
}
