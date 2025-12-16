import { useRef } from 'react';
import { useTranslation } from 'next-i18next';
import { IoDownload, IoTrash, IoPrint, IoCloudUpload } from 'react-icons/io5';
import { FaFilePdf } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { OscratProductVersionStatus, type Attachment } from '@oscrat/model';
import { formatFileSize } from '@/lib/utils';
import { validateBrowserFile } from '@/lib/utils/docFileValidation';

interface DocDisplayProps {
  doc: Attachment;
  downloadUrl: string;
  onUploadSigned: (file: File) => Promise<void>;
  onDelete: () => void;
  isUploading: boolean;
  versionStatus: string;
}

export default function DocDisplay({
  doc,
  downloadUrl,
  onUploadSigned,
  onDelete,
  isUploading,
  versionStatus,
}: DocDisplayProps) {
  const { t } = useTranslation('common');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePrint = () => {
    window.open(downloadUrl, '_blank');
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!validateBrowserFile(file, 'doc')) {
      toast.error(t('oscrat.ui.doc.doc-invalid-file-type'));
      return;
    }

    await onUploadSigned(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const isSupported = versionStatus === OscratProductVersionStatus.SUPPORTED;

  return (
    <div className="rounded-lg border border-gray-300 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-700">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FaFilePdf className="h-8 w-8 text-red-500" />
          <div>
            <p className="font-medium text-gray-900 dark:text-white">{doc.name}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {formatFileSize(doc.fileSize)} • {new Date(doc.createdAt).toLocaleDateString()}
            </p>
            {isSupported && (
              <span className="mt-1 inline-block rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 dark:bg-green-800 dark:text-green-100">
                {t('oscrat.ui.doc.signed')}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-500"
          >
            <IoPrint className="h-4 w-4" />
            {t('oscrat.ui.doc.print')}
          </button>

          <a
            href={downloadUrl}
            className="flex items-center gap-1 rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            <IoDownload className="h-4 w-4" />
            {t('download')}
          </a>

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleFileSelect}
            className="hidden"
            id="signed-doc-upload"
          />
          <label
            htmlFor="signed-doc-upload"
            className="flex cursor-pointer items-center gap-1 rounded-md border border-green-300 bg-white px-3 py-1.5 text-sm font-medium text-green-700 hover:bg-green-50 dark:border-green-600 dark:bg-gray-600 dark:text-green-400 dark:hover:bg-gray-500"
          >
            <IoCloudUpload className="h-4 w-4" />
            {isUploading ? t('oscrat.ui.doc.uploading') : t('oscrat.ui.doc.upload-signed')}
          </label>

          <button
            onClick={onDelete}
            className="flex items-center gap-1 rounded-md border border-red-300 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-600 dark:hover:bg-red-900/20"
          >
            <IoTrash className="h-4 w-4" />
            {t('delete')}
          </button>
        </div>
      </div>
    </div>
  );
}

