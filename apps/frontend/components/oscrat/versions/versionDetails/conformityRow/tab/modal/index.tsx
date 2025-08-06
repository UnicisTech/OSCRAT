import React, { useEffect, useRef } from 'react';
import { IoClose } from 'react-icons/io5';
import { useTranslation } from 'next-i18next';

interface ModalContentItem {
  question: string;
  answer: string;
}

interface ViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: ModalContentItem[];
  variant: 'edit' | 'download';
  onEdit?: () => void;
  onDownload?: () => void;
}

const ViewModal: React.FC<ViewModalProps> = ({
  isOpen,
  onClose,
  title,
  content,
  variant,
  onEdit,
  onDownload,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation('common');

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

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const primaryAction =
    variant === 'edit'
      ? { label: 'Edit', onClick: onEdit }
      : { label: 'Download', onClick: onDownload };

  return (
    <div className="fixed inset-0 z-50 !ml-0 flex items-center justify-center bg-black bg-opacity-60 transition-opacity duration-300">
      <div
        ref={modalRef}
        className="animate-fade-in-up flex max-h-[90vh] w-full max-w-3xl flex-col rounded-lg bg-white shadow-2xl"
      >
        <header className="flex items-center justify-between border-b border-gray-200 p-4">
          <h2 className="text-[14px] font-semibold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 transition-colors hover:text-gray-600"
            aria-label="Close modal"
          >
            <IoClose size={24} />
          </button>
        </header>
        <main className="max-h-[60vh] space-y-5 overflow-y-auto p-6 text-[14px]">
          {content.map((item, index) => (
            <div key={index}>
              <p className="mb-1 font-semibold text-gray-900">
                {index + 1}. {item.question}
              </p>
              <p className="border-l-2 border-gray-200 pl-4 text-gray-900">
                {item.answer}
              </p>
            </div>
          ))}
        </main>
        <footer className="flex items-center justify-end space-x-3 rounded-b-lg border-t border-gray-200 bg-gray-50 p-4">
          <button
            onClick={primaryAction.onClick}
            className="bg-white px-4 py-1 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {primaryAction.label}
          </button>
          <button
            onClick={onClose}
            className="rounded-md border border-transparent bg-blue-800 px-4 py-1 text-sm font-medium text-white transition-all hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {t('cancel')}
          </button>
        </footer>
      </div>
    </div>
  );
};

export default ViewModal;
