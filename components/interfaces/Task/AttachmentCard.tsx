import React from 'react';
import { useTranslation } from 'next-i18next';
import { Attachment } from 'types';
import toast from 'react-hot-toast';
import { AccessControl } from '@/components/shared/AccessControl';
import { useAttachments } from '@/hooks/useAttachments';
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
  const { deleteAttachment } = useAttachments(teamSlug, taskNumber);

  const handleDelete = async () => {
    try {
      await deleteAttachment(attachment.id);
      toast.success(t('attachment-deleted'));
    } catch (error: unknown) {
      toast.error(extractErrorMessage(error, t('attachment-delete-error')));
    }
  };

  return (
    <div className="flex flex-row items-center justify-between p-2 text-center rounded-md w-full">
      <a
        href={`/api/teams/${teamSlug}/tasks/${taskNumber}/attachments?id=${attachment.id}`}
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
          <p className="hover:underline">{attachment.filename}</p>
        </div>
      </a>
      <AccessControl resource="task" actions={['update']}>
        <button
          className="flex items-center p-1 text-red-500 rounded hover:bg-gray-100"
          onClick={handleDelete}
          title={t('delete')}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5"
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
