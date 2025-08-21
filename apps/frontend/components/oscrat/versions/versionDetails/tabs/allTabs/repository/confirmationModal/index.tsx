import React from 'react';
import { IoClose, IoWarning } from 'react-icons/io5';
import Button, { LoadingButton } from '@atlaskit/button';
import { useTranslation } from 'next-i18next';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  variant?: 'danger' | 'warning' | 'info';
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  cancelText,
  isLoading = false,
  variant = 'danger',
}) => {
  const { t } = useTranslation('common');

  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          icon: 'text-red-600',
          iconBg: 'bg-red-100',
          confirmButton: 'danger' as const,
        };
      case 'warning':
        return {
          icon: 'text-yellow-600',
          iconBg: 'bg-yellow-100',
          confirmButton: 'warning' as const,
        };
      default:
        return {
          icon: 'text-blue-600',
          iconBg: 'bg-blue-100',
          confirmButton: 'primary' as const,
        };
    }
  };

  const styles = getVariantStyles();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4">
      <div className="animate-fade-in-up w-full max-w-md rounded-lg bg-white shadow-2xl">
        <div className="p-6">
          <div className="flex items-start">
            <div
              className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full ${styles.iconBg}`}
            >
              <IoWarning className={`h-6 w-6 ${styles.icon}`} />
            </div>
            <div className="ml-4 flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                <button
                  onClick={onClose}
                  disabled={isLoading}
                  className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
                  type="button"
                >
                  <IoClose size={24} />
                </button>
              </div>
              <div className="mt-2">
                <p className="text-sm text-gray-600">{message}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end space-x-3 rounded-b-lg bg-gray-50 px-6 py-4">
          <Button
            appearance="default"
            onClick={onClose}
            isDisabled={isLoading}
            type="button"
          >
            {cancelText || t('cancel')}
          </Button>
          <LoadingButton
            appearance={styles.confirmButton}
            onClick={onConfirm}
            isLoading={isLoading}
            type="button"
          >
            {confirmText || t('confirm')}
          </LoadingButton>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
