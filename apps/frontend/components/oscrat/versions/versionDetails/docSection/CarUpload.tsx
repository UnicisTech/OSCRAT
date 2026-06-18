import { useRef } from 'react';
import { useTranslation } from 'next-i18next';
import { IoDownload, IoTrash } from 'react-icons/io5';
import toast from 'react-hot-toast';
import type { Attachment } from '@oscrat/model';
import { formatFileSize } from '@/lib/utils';
import { validateBrowserFile } from '@/lib/utils/docFileValidation';
import { getFileIcon } from '@/lib/utils/fileIcons';
import Button from '@/components/button';
import { formatDateShort } from '@/utils/dateFormat';

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

  const handleFileSelect = async (file: File) => {
    if (!validateBrowserFile(file, 'car')) {
      toast.error(t('oscrat.ui.doc.car-invalid-file-type'));
      return;
    }

    await onUpload(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  if (car) {
    return (
      <div className="border-line bg-surface-muted rounded-card flex items-center justify-between border p-4">
        <div className="flex items-center gap-3">
          {getFileIcon(car.mimeType ?? undefined)}
          <div>
            <p className="text-content font-medium">{car.name}</p>
            <p className="text-content-muted text-sm">
              {formatFileSize(car.fileSize)} • {formatDateShort(car.createdAt)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={downloadUrl}
            className="bg-primary hover:bg-primary-dark text-content-inverse rounded-input flex items-center gap-1 px-3 py-1.5 text-sm font-medium"
          >
            <IoDownload className="h-4 w-4" />
            {t('download')}
          </a>
          <Button
            tone="danger"
            variant="secondary"
            size="m"
            onClick={onDelete}
            startIcon={<IoTrash className="h-4 w-4" />}
          >
            {t('delete')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.xls,.xlsx,application/pdf,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        onChange={handleInputChange}
        className="hidden"
        id="car-upload"
      />
      <Button
        variant="primary"
        size="m"
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
      >
        {isUploading
          ? t('oscrat.ui.doc.uploading')
          : t('oscrat.ui.doc.upload-car')}
      </Button>
    </>
  );
}
