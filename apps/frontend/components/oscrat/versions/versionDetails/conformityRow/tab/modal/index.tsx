import React, { useEffect, useRef } from 'react';
import { IoClose } from 'react-icons/io5';
import { useTranslation } from 'next-i18next';
import type { ComplianceStatus } from '@/constants/conformityStatuses';
import { getStatusIcon, getStatusColor } from '@/lib/compliance/statusUtils';
import { getComplianceAssessmentStatusTranslationKey } from '@/constants/conformityStatuses';

interface ModalContentQuestion {
  question: string;
  answer: string;
}

interface ModalContentRequirement {
  requirementTitle: string;
  requirementId: string;
  status?: ComplianceStatus;
  questions: ModalContentQuestion[];
}

interface ModalContentArea {
  areaTitle: string;
  areaId: number;
  requirements: ModalContentRequirement[];
}

interface ModalContentItem {
  question: string;
  answer: string;
}

interface ViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content?: ModalContentItem[];
  structuredContent?: ModalContentArea[];
  variant: 'edit' | 'download';
  onEdit?: () => void;
  onDownload?: () => void;
}

const ViewModal: React.FC<ViewModalProps> = ({
  isOpen,
  onClose,
  title,
  content,
  structuredContent,
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
        className="animate-fade-in-up flex max-h-[90vh] w-full max-w-4xl flex-col rounded-lg bg-white shadow-2xl"
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
        <main className="max-h-[70vh] overflow-y-auto p-6 text-[14px]">
          {structuredContent ? (
            <div className="space-y-6">
              {structuredContent.map((area, areaIndex) => (
                <div key={area.areaId} className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-100 px-4 py-3 border-b border-gray-200">
                    <h3 className="font-semibold text-gray-900">
                      {areaIndex + 1}. {area.areaTitle}
                    </h3>
                  </div>
                  <div className="p-4 space-y-6">
                    {area.requirements.map((requirement, reqIndex) => (
                      <div key={requirement.requirementId} className="border-l-2 border-blue-200 pl-4">
                        <div className="flex items-start justify-between mb-3">
                          <h4 className="font-medium text-gray-800 flex-1">
                            {areaIndex + 1}.{reqIndex + 1} {requirement.requirementTitle}
                          </h4>
                          {requirement.status && (
                            <div className="flex items-center gap-2 ml-4">
                              {getStatusIcon(requirement.status)}
                              <span className={`text-xs font-medium ${getStatusColor(requirement.status)}`}>
                                {t(getComplianceAssessmentStatusTranslationKey(requirement.status))}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="space-y-3">
                          {requirement.questions.map((question, qIndex) => (
                            <div key={qIndex} className="bg-gray-50 rounded p-3">
                              <p className="text-sm font-medium text-gray-700 mb-1">
                                Q{qIndex + 1}: {question.question}
                              </p>
                              <p className="text-sm text-gray-900 border-l-2 border-gray-300 pl-3">
                                {question.answer}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : content ? (
            <div className="space-y-5">
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
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">{t('oscrat.ui.no-data-available')}</p>
          )}
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
