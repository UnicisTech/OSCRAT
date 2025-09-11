import React, { useState, useRef, useEffect } from 'react';
import { FaUpload } from 'react-icons/fa';
import { IoClose } from 'react-icons/io5';
import { useTranslation } from 'next-i18next';
import toast from 'react-hot-toast';

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
  const modalRef = useRef<HTMLDivElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState('No file chosen');

  const { t, ready } = useTranslation('common');

  // Update fileName when translation is ready
  useEffect(() => {
    if (ready && fileName === 'No file chosen') {
      setFileName(t('oscrat.ui.versions.sbom.no-file-chosen'));
    }
  }, [ready, t, fileName]);

  // Handle closing the modal when clicking outside of it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4">
      <div
        ref={modalRef}
        className="animate-fade-in-up flex w-full max-w-md flex-col rounded-lg bg-white shadow-2xl"
      >
        <header className="flex items-center justify-between border-b border-gray-200 p-4">
          <h2 className="text-lg font-semibold text-gray-800">
            {t('import-file')}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <IoClose size={24} />
          </button>
        </header>
        <form onSubmit={handleSubmit}>
          <main className="space-y-4 p-6">
            <div className="mb-4">
              <p className="text-sm text-gray-600">
                {t('oscrat.ui.versions.sbom.import-description')}
              </p>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                {t('file')}
              </label>
              <div className="mt-1 flex justify-center rounded-md border-2 border-dashed border-gray-300 px-6 pb-6 pt-5">
                <div className="space-y-1 text-center">
                  <FaUpload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer rounded-md bg-white font-medium text-blue-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2 hover:text-blue-500"
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
                  <p className="text-xs text-gray-500">{fileName}</p>
                </div>
              </div>
            </div>
          </main>
          <footer className="flex items-center justify-end space-x-3 rounded-b-lg border-t border-gray-200 bg-gray-50 p-4">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              className="rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              {t('import')}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
};

export default ImportModal;
