import { useState, useRef } from 'react';
import { useTranslation } from 'next-i18next';
import { IoCloudUpload, IoDownload, IoTrash } from 'react-icons/io5';
import toast from 'react-hot-toast';
import type { Attachment } from '@oscrat/model';
import { formatFileSize } from '@/lib/utils';
import { validateBrowserFile } from '@/lib/utils/docFileValidation';
import { getFileIcon } from '@/lib/utils/fileIcons';

/**
 * Props for the CAR (Conformity Assessment Report) upload component.
 *
 * A Conformity Assessment Report is a prerequisite document required before
 * generating a Declaration of Conformity (DoC) for a product version. It can
 * be either a third-party assessment (uploaded PDF/XLS) or generated from a
 * completed self-assessment questionnaire.
 */
interface CarUploadProps {
  /** Existing CAR attachment metadata, if one has been uploaded */
  car?: Attachment;
  /** Handler to upload a new CAR file (replaces existing) */
  onUpload: (file: File) => Promise<void>;
  onDelete: () => void;
  downloadUrl: string;
  isUploading: boolean;
}

/**
 * CAR (Conformity Assessment Report) upload component.
 *
 * Displays either a drag-and-drop upload zone (when no CAR exists) or the
 * uploaded CAR with download/delete actions. Accepts PDF and Excel files only.
 */
export default function CarUpload({
  car,
  onUpload,
  onDelete,
  downloadUrl,
  isUploading,
}: CarUploadProps) {
  const { t } = useTranslation('common');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFileSelect = async (file: File) => {
    if (!validateBrowserFile(file, 'car')) {
      toast.error(t('oscrat.ui.doc.car-invalid-file-type'));
      return;
    }

    await onUpload(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  if (car) {
    return (
      <div className="flex items-center justify-between rounded-lg border border-gray-300 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-700">
        <div className="flex items-center gap-3">
          {getFileIcon(car.mimeType ?? undefined)}
          <div>
            <p className="font-medium text-gray-900 dark:text-white">{car.name}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {formatFileSize(car.fileSize)} • {new Date(car.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={downloadUrl}
            className="flex items-center gap-1 rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            <IoDownload className="h-4 w-4" />
            {t('download')}
          </a>
          <button
            onClick={onDelete}
            className="flex items-center gap-1 rounded-md border border-red-300 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-600 dark:hover:bg-red-900/20"
          >
            <IoTrash className="h-4 w-4" />
            {t('delete')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
        dragOver
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
          : 'border-gray-300 hover:border-gray-400 dark:border-gray-600'
      }`}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.xls,.xlsx,application/pdf,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        onChange={handleInputChange}
        className="hidden"
        id="car-upload"
      />
      <label htmlFor="car-upload" className="cursor-pointer">
        <IoCloudUpload className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
          {isUploading
            ? t('oscrat.ui.doc.uploading')
            : t('oscrat.ui.doc.upload-car')}
        </p>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          {t('oscrat.ui.doc.car-file-types')}
        </p>
      </label>
    </div>
  );
}

