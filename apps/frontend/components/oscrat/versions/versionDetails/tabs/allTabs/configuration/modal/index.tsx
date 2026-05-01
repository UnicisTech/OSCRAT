import React, { useState, useRef, useEffect } from 'react';
import { FaUpload, FaFileAlt } from 'react-icons/fa';
import { HiOutlineRefresh } from 'react-icons/hi';
import { IoClose } from 'react-icons/io5';
import { useTranslation } from 'next-i18next';
import toast from 'react-hot-toast';

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
  const modalRef = useRef<HTMLDivElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { t, ready } = useTranslation('common');

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (submitting) return;
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
  }, [isOpen, onClose, submitting]);

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
        toast.error(
          t('oscrat.ui.versions.configuration.select-valid-file')
        );
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
            disabled={submitting}
            className="text-gray-400 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <IoClose size={24} />
          </button>
        </header>
        <form onSubmit={handleSubmit}>
          <main className="space-y-4 p-6">
            <div className="mb-4">
              <p className="text-sm text-gray-600">
                {t('oscrat.ui.versions.configuration.import-description')}
              </p>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                {t('file')}
              </label>
              {file ? (
                <div className="mt-1 flex items-center justify-between rounded-md border-2 border-solid border-blue-300 bg-blue-50 px-4 py-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <FaFileAlt className="h-6 w-6 flex-shrink-0 text-blue-600" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-gray-800">
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {(file.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFile(null)}
                    disabled={submitting}
                    className="ml-3 flex-shrink-0 rounded-md p-1 text-gray-400 hover:bg-white hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
                    aria-label={t('cancel')}
                  >
                    <IoClose size={20} />
                  </button>
                </div>
              ) : (
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
                          disabled={submitting}
                        />
                      </label>
                      <p className="pl-1">{t('or-drag-and-drop')}</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      {t('oscrat.ui.versions.configuration.no-file-chosen')}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </main>
          <footer className="flex items-center justify-end space-x-3 rounded-b-lg border-t border-gray-200 bg-gray-50 p-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={submitting}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitting && (
                <HiOutlineRefresh className="h-4 w-4 animate-spin" />
              )}
              {submitting ? t('uploading') : t('import')}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
};

export default ImportModal;
