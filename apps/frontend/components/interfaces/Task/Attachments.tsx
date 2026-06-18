import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/router';
import type { Task } from '@oscrat/model';
import type { Attachment } from 'types';
import AttachmentsCard from './AttachmentCard';
import { checkExtensionAndMIMEType } from '@/utils/fileValidation';
import useCanAccess from '@/hooks/useCanAccess';
import { useTranslation } from 'next-i18next';
import { EmptyState } from '@/components/shared';
import { useTaskAttachments } from '@/hooks/useTaskAttachments';
import { extractErrorMessage } from '@/lib/utils';

type TaskWithAttachments = Task & {
  attachments?: Attachment[];
};

const Attachments = ({ task }: { task: Task }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { t } = useTranslation('common');
  const { slug, taskNumber, task: taskParam } = router.query;
  const routeTaskNumber = Array.isArray(taskNumber)
    ? taskNumber[0]
    : taskNumber || (Array.isArray(taskParam) ? taskParam[0] : taskParam) || '';
  const { canAccess } = useCanAccess(slug as string);
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const { uploadAttachment } = useTaskAttachments(
    slug as string,
    routeTaskNumber
  );

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    const file = files[0];
    const isAvailable = checkExtensionAndMIMEType(file);
    if (isAvailable) {
      setSelectedFile(file);
    } else {
      toast.error('Not supported type of file');
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];

      const reader = new FileReader();
      reader.onloadend = () => {
        const isAvailable = checkExtensionAndMIMEType(file);
        if (isAvailable) {
          setSelectedFile(file);
        } else {
          toast.error('Not supported type of file');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClick = () => {
    if (inputRef.current) {
      inputRef.current.click();
    }
  };

  useEffect(() => {
    const uploadFile = async () => {
      if (selectedFile && typeof slug === 'string' && routeTaskNumber) {
        try {
          await uploadAttachment({
            file: selectedFile,
            taskId: task.id,
          });
          toast.success('Attachment uploaded');
        } catch (error: unknown) {
          toast.error(
            extractErrorMessage(error, 'Failed to upload attachment')
          );
        }
      }
    };

    uploadFile();
  }, [routeTaskNumber, selectedFile, slug, task.id, uploadAttachment]);

  // TODO: refactoring after attachments added in DB
  const attachments = (task as TaskWithAttachments).attachments || [];
  if (!task) {
    return null;
  }

  if (!canAccess('task', ['update'])) {
    return (
      <>
        {attachments.length ? (
          <div className="flex w-full items-center justify-center">
            <div
              className={`flex flex-wrap ${
                attachments.length ? 'justify-start' : 'justify-center'
              } bg-surface h-full w-full border-2 px-4 py-2 transition ${
                isDragOver ? 'border-info' : 'border-line'
              } hover:border-line rounded-card cursor-pointer appearance-none border-dashed focus:outline-none`}
            >
              {attachments.map((attachment, index: number) => (
                <AttachmentsCard
                  key={index}
                  attachment={attachment}
                  taskNumber={routeTaskNumber}
                  teamSlug={slug as string}
                />
              ))}
            </div>
          </div>
        ) : (
          <EmptyState title={t('oscrat.ui.no-attachments')} />
        )}
      </>
    );
  }

  return (
    <div className="flex w-full items-center justify-center">
      <div
        className={`flex flex-wrap ${
          attachments.length ? 'justify-start' : 'justify-center'
        } bg-surface h-full w-full border-2 px-4 py-2 transition ${
          isDragOver ? 'border-info' : 'border-line'
        } hover:border-line rounded-card cursor-pointer appearance-none border-dashed focus:outline-none`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        {attachments.length ? (
          attachments.map((attachment, index: number) => (
            <AttachmentsCard
              key={index}
              attachment={attachment}
              taskNumber={routeTaskNumber}
              teamSlug={slug as string}
            />
          ))
        ) : (
          <div className="flex items-center justify-center">
            <span className="flex items-center space-x-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="text-content-secondary h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 1 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <span className="text-content-secondary font-medium">
                {isDragOver
                  ? 'Release to attach files'
                  : 'Drop files to attach, or '}
                <span className="text-primary underline">browse</span>
              </span>
            </span>
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          name="file_upload"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
    </div>
  );
};

export default Attachments;
