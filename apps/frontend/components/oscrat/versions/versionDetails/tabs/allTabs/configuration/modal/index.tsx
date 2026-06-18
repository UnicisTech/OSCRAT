import React, { useState } from 'react';
import { FaUpload, FaFileAlt } from 'react-icons/fa';
import { IoClose } from 'react-icons/io5';
import { useTranslation } from 'next-i18next';
import toast from 'react-hot-toast';
import Button from '@/components/button';
import Modal from '@/components/shared/Modal';

const ACCEPTED_FILE_EXTENSIONS = ['xml'] as const;

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportAsJob: (file: File) => Promise<void>;
}

const ImportModal: React.FC<ImportModalProps> = ({
  isOpen,
  onClose,
  onImportAsJob,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { t, ready } = useTranslation('common');

  if (!ready) {
    return null;
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      const fileExtension = selectedFile.name.toLowerCase().split('.').pop();

      if (
        !fileExtension ||
        !ACCEPTED_FILE_EXTENSIONS.includes(
          fileExtension as (typeof ACCEPTED_FILE_EXTENSIONS)[number]
        )
      ) {
        toast.error(t('oscrat.ui.versions.configuration.select-valid-file'));
        e.target.value = '';
        return;
      }

      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error(t('oscrat.ui.versions.configuration.please-select-file'));
      return;
    }
    setSubmitting(true);
    try {
      await onImportAsJob(file);
    } finally {
      setSubmitting(false);
      handleClose();
    }
  };

  const handleClose = () => {
    setFile(null);
    onClose();
  };

  return (
    <Modal open={isOpen} close={submitting ? undefined : handleClose} size="sm">
      <Modal.Header>{t('import-file')}</Modal.Header>
      <form onSubmit={handleSubmit}>
        <Modal.Body>
          <div className="space-y-4">
            <div className="mb-4">
              <p className="text-content-secondary text-sm">
                {t('oscrat.ui.versions.configuration.import-description')}
              </p>
            </div>
            <div>
              <label className="text-content-secondary mb-1 block text-sm font-medium">
                {t('file')}
              </label>
              {file ? (
                <div className="bg-info-subtle border-info-border rounded-card mt-1 flex items-center justify-between border-2 border-solid px-4 py-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <FaFileAlt className="text-primary h-6 w-6 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-content truncate text-sm font-medium">
                        {file.name}
                      </p>
                      <p className="text-content-muted text-xs">
                        {(file.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="tertiary"
                    size="m"
                    onClick={() => setFile(null)}
                    disabled={submitting}
                    className="ml-3 flex-shrink-0"
                    aria-label={t('cancel')}
                    icon={<IoClose size={20} />}
                  />
                </div>
              ) : (
                <div className="border-line rounded-card mt-1 flex justify-center border-2 border-dashed px-6 pb-6 pt-5">
                  <div className="space-y-1 text-center">
                    <FaUpload className="text-content-placeholder mx-auto h-12 w-12" />
                    <div className="text-content-secondary flex text-sm">
                      <label
                        htmlFor="file-upload"
                        className="bg-surface text-primary focus-within:ring-primary hover:text-info rounded-input relative cursor-pointer font-medium focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2"
                      >
                        <span>{t('upload-a-file')}</span>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          accept=".xml"
                          className="sr-only"
                          onChange={handleFileChange}
                          disabled={submitting}
                        />
                      </label>
                      <p className="pl-1">{t('or-drag-and-drop')}</p>
                    </div>
                    <p className="text-content-muted text-xs">
                      {t('oscrat.ui.versions.configuration.no-file-chosen')}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={submitting}
            text={t('cancel')}
          />
          <Button
            type="submit"
            variant="primary"
            disabled={submitting}
            loading={submitting}
            text={submitting ? t('uploading') : t('import')}
          />
        </Modal.Footer>
      </form>
    </Modal>
  );
};

export default ImportModal;
