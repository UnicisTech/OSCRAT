import React, { useEffect } from 'react';
import { IoClose } from 'react-icons/io5';
import Button from './Button';
import Divider from './Divider';

interface FullScreenModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  text?: string;
  cancelButtonText: string;
  continueButtonText: string;
  onCancel?: () => void;
  onContinue?: () => void;
  children?: React.ReactNode;
}

const FullScreenModal: React.FC<FullScreenModalProps> = ({
  isOpen,
  onClose,
  title,
  text,
  cancelButtonText,
  continueButtonText,
  onCancel,
  onContinue,
  children,
}) => {
  // Handle ESC key press
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  const handleCancel = () => {
    onCancel ? onCancel() : onClose();
  };

  const handleContinue = () => {
    onContinue && onContinue();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30"
      onClick={handleBackdropClick}
    >
      {/* Modal Content */}
      <div className="relative z-10 flex w-full max-w-md flex-col rounded-lg bg-white py-4 shadow-xl dark:bg-gray-800">
        <div className="flex items-center justify-between pb-2">
          {/* Title */}
          <h2 className="pl-6 pr-8 text-sm font-bold text-gray-900 dark:text-gray-100">
            {title}
          </h2>

          {/* Close button (X) in top right */}
          <div
            onClick={onClose}
            className="cursor-pointer rounded-full p-1 px-6 text-gray-500"
            aria-label="Close modal"
          >
            <IoClose size={26} />
          </div>
        </div>

        {/* Modal Content - Flex Column */}
        <div className="flex flex-col space-y-4">
          <Divider />
          {/* Text/Description */}
          {text && (
            <p className="px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">
              {text}
            </p>
          )}
          {children && <div className="px-6 py-2">{children}</div>}
          <Divider />
          {/* Buttons */}
          <div className="ml-auto flex min-w-fit flex-col space-y-3 px-6 sm:min-w-[250px] sm:flex-row sm:justify-end sm:space-x-3 sm:space-y-0">
            <Button
              text={cancelButtonText}
              onClick={handleCancel}
              variant="ghost"
            />

            <Button
              text={continueButtonText}
              onClick={handleContinue}
              variant="primary"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FullScreenModal;
