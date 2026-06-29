import React, { useState, useEffect } from 'react';
import { FaUpload } from 'react-icons/fa';
import { useTranslation } from 'next-i18next';
import toast from 'react-hot-toast';
import Button from '@/components/button';
import Modal from '@/components/shared/Modal';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportAsJob: (file: File) => void;
}

const ImportModal: React.FC<ImportModalProps> = ({
  isOpen,
  onClose,
  onImportAsJob,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState('No file chosen');

  const { t, ready } = useTranslation('common');

  // Update fileName when translation is ready
  useEffect(() => {
    if (ready && fileName === 'No file chosen') {
      setFileName(t('oscrat.ui.versions.sbom.no-file-chosen'));
    }
  }, [ready, t, fileName]);

  if (!ready) {
    return null;
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      const fileExtension = selectedFile.name.toLowerCase().split('.').pop();

      // Valid CycloneDX file extensions
      const validExtensions = ['xml'];

      if (!fileExtension || !validExtensions.includes(fileExtension)) {
        toast.error(t('oscrat.ui.versions.sbom.select-valid-sbom-file'));
        e.target.value = '';
        return;
      }

      setFile(selectedFile);
      setFileName(selectedFile.name);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error(t('oscrat.ui.versions.sbom.please-select-file'));
      return;
    }
    onImportAsJob(file);
    handleClose();
  };

  const handleClose = () => {
    setFile(null);
    setFileName(t('oscrat.ui.versions.sbom.no-file-chosen'));
    onClose();
  };

  return (
    <Modal open={isOpen} close={handleClose} size="sm">
      <Modal.Header>{t('import-file')}</Modal.Header>
      <form onSubmit={handleSubmit} className="contents">
        <Modal.Body>
          <div className="space-y-4">
            <div className="mb-4">
              <p className="text-content-secondary text-sm">
                {t('oscrat.ui.versions.sbom.import-description')}
              </p>
            </div>
            <div>
              <label className="text-content-secondary mb-1 block text-sm font-medium">
                {t('file')}
              </label>
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
                      />
                    </label>
                    <p className="pl-1">{t('or-drag-and-drop')}</p>
                  </div>
                  <p className="text-content-muted text-xs">{fileName}</p>
                </div>
              </div>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            text={t('cancel')}
          />
          <Button type="submit" variant="primary" text={t('import')} />
        </Modal.Footer>
      </form>
    </Modal>
  );
};

export default ImportModal;
