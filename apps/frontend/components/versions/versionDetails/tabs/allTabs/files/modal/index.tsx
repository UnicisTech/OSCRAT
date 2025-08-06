import React, { useState, useEffect, useRef } from 'react';
import { IoClose, IoCloudUpload } from 'react-icons/io5';
import { useTranslation } from 'next-i18next';

interface FileData {
  id: string;
  name: string;
  type: string;
  version: string;
  dateAdded: string;
  addedBy: string;
  lastEdited: string;
  editedBy: string;
  file?: File;
}

interface AddFileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddFile: (
    newFile: Omit<FileData, 'id' | 'dateAdded' | 'lastEdited'>
  ) => void;
}

const AddFileModal: React.FC<AddFileModalProps> = ({
  isOpen,
  onClose,
  onAddFile,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [version, setVersion] = useState('');
  const [addedBy, setAddedBy] = useState('');
  const [editedBy, setEditedBy] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const { t, ready } = useTranslation('common');
  if (!ready) return null;

  // Handle closing the modal when clicking outside of it.
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
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Reset form and close modal
  const handleClose = () => {
    setName('');
    setType('');
    setVersion('');
    setAddedBy('');
    setEditedBy('');
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  };

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Auto-fill name if not already filled
      if (!name) {
        setName(file.name);
      }
      // Auto-detect type from file extension
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      if (!type && fileExtension) {
        setType(fileExtension);
      }
    }
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !type || !version || !addedBy || !editedBy) {
      alert('Please fill out all required fields.');
      return;
    }
    onAddFile({
      name,
      type,
      version,
      addedBy,
      editedBy,
      file: selectedFile || undefined,
    });
    handleClose();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4">
      <div
        ref={modalRef}
        className="animate-fade-in-up flex max-h-[90vh] w-full max-w-lg flex-col overflow-y-auto rounded-lg bg-white shadow-2xl"
      >
        <header className="flex items-center justify-between border-b border-gray-200 p-4">
          <h2 className="text-lg font-semibold text-gray-800">
            {t('oscrat.ui.add-new-file')}
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
            {/* File Upload Section */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                {t('oscrat.ui.upload-file')}
                <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  id="fileUpload"
                />
                <label
                  htmlFor="fileUpload"
                  className="flex w-full cursor-pointer items-center justify-center rounded-md border-2 border-dashed border-gray-300 px-4 py-6 text-center hover:border-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <div className="space-y-2">
                    <IoCloudUpload className="mx-auto h-8 w-8 text-gray-400" />
                    <div className="text-sm text-gray-600">
                      {selectedFile ? (
                        <span className="font-medium text-blue-600">
                          {selectedFile.name}
                        </span>
                      ) : (
                        <>
                          <span className="font-medium text-blue-600">
                            {t('click-to-upload')}
                          </span>{' '}
                          <span className="text-gray-500">
                            {t('oscrat.ui.or-drag-and-drop')}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* File Name */}
            <div>
              <label
                htmlFor="fileName"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                {t('file-name')}
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="fileName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                placeholder="Enter file name"
              />
            </div>

            {/* File Type */}
            <div>
              <label
                htmlFor="fileType"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                {t('type')} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="fileType"
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                placeholder="e.g., pdf, docx, xlsx"
              />
            </div>

            {/* Version */}
            <div>
              <label
                htmlFor="fileVersion"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                {t('version')} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="fileVersion"
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                placeholder="e.g., 1.0, v2.1"
              />
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
              {t('oscrat.ui.add-file')}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
};

export default AddFileModal;
