import { useRef } from 'react';
import { useTranslation } from 'next-i18next';
import { IoDownload, IoTrash, IoPrint, IoCloudUpload } from 'react-icons/io5';
import { FaFilePdf } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { OscratProductVersionStatus, type Attachment } from '@oscrat/model';
import Button from '@/components/button';
import SuccessBadge from '@/components/oscrat/shared/SuccessBadge';
import { formatFileSize } from '@/lib/utils';
import { validateBrowserFile } from '@/lib/utils/docFileValidation';
import { isEmptyFile } from '@/utils/fileValidation';
import { formatDateShort } from '@/utils/dateFormat';

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

  const handlePrint = async () => {
    try {
      const response = await fetch(downloadUrl);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      const printWindow = window.open(blobUrl, '_blank');

      if (printWindow) {
        printWindow.onload = () => {
          printWindow.focus();
          printWindow.print();
        };

        setTimeout(() => {
          printWindow.focus();
          printWindow.print();
        }, 1000);
      }
    } catch {
      window.open(downloadUrl, '_blank');
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (isEmptyFile(file)) {
      toast.error(t('oscrat.ui.validation.file-empty'));
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    if (!validateBrowserFile(file, 'doc')) {
      toast.error(t('oscrat.ui.doc.doc-invalid-file-type'));
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    await onUploadSigned(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const isSupported = versionStatus === OscratProductVersionStatus.SUPPORTED;

  return (
    <div className="border-line bg-surface-muted rounded-card border p-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <FaFilePdf className="text-danger h-8 w-8 flex-shrink-0" />
          <div className="min-w-0">
            <p className="text-content truncate font-medium" title={doc.name}>
              {doc.name}
            </p>
            <p className="text-content-muted text-sm">
              {formatFileSize(doc.fileSize)} • {formatDateShort(doc.createdAt)}
            </p>
            {isSupported && (
              <SuccessBadge
                className="mt-1"
                label={t('oscrat.ui.doc.signed')}
              />
            )}
          </div>
        </div>

        <div className="flex flex-shrink-0 items-center gap-2">
          <Button
            variant="secondary"
            size="m"
            onClick={handlePrint}
            startIcon={<IoPrint className="h-4 w-4" />}
          >
            {t('oscrat.ui.doc.print')}
          </Button>

          <a
            href={downloadUrl}
            className="bg-primary hover:bg-primary-dark text-content-inverse rounded-input flex items-center gap-1 px-3 py-1.5 text-sm font-medium"
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
            className="border-success-border bg-surface text-success hover:bg-success-subtle rounded-input flex cursor-pointer items-center gap-1 border px-3 py-1.5 text-sm font-medium"
          >
            <IoCloudUpload className="h-4 w-4" />
            {isUploading
              ? t('oscrat.ui.doc.uploading')
              : t('oscrat.ui.doc.upload-signed')}
          </label>

          <Button
            variant="secondary"
            tone="danger"
            size="m"
            onClick={onDelete}
            startIcon={<IoTrash className="h-4 w-4" />}
          >
            {t('delete')}
          </Button>
        </div>
      </div>
    </div>
  );
}
