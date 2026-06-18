import React from 'react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'next-i18next';
import { Button } from '@/components/shared';
import Modal from '@/components/shared/Modal';

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
          icon: 'text-danger',
          iconBg: 'bg-danger-subtle',
          confirmButton: 'primary' as const,
        };
      case 'warning':
        return {
          icon: 'text-warning',
          iconBg: 'bg-warning-subtle',
          confirmButton: 'primary' as const,
        };
      default:
        return {
          icon: 'text-primary',
          iconBg: 'bg-info-subtle',
          confirmButton: 'primary' as const,
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <Modal open={isOpen} close={onClose} size="sm">
      <Modal.Header>{title}</Modal.Header>
      <Modal.Body>
        <div className="flex items-start">
          <div
            className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full ${styles.iconBg}`}
          >
            <ExclamationTriangleIcon className={`h-6 w-6 ${styles.icon}`} />
          </div>
          <div className="ml-4 flex-1">
            <p className="text-content-secondary text-sm leading-relaxed">
              {message}
            </p>
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button
          onClick={onClose}
          type="button"
          variant="secondary"
          text={cancelText || t('cancel')}
          disabled={isLoading}
        />
        <Button
          onClick={onConfirm}
          type="button"
          variant={styles.confirmButton}
          text={confirmText || t('confirm')}
          disabled={isLoading}
        />
      </Modal.Footer>
    </Modal>
  );
};

export default ConfirmationModal;
