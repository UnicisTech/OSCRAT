import { useTranslation } from 'next-i18next';
import { FullScreenModal } from '@/components/shared';
import React from 'react';

interface VersionActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  action: 'delete' | 'withdraw' | null;
  versionName: string;
  onConfirm: () => void;
}

const VersionActionModal: React.FC<VersionActionModalProps> = ({
  isOpen,
  onClose,
  action,
  versionName,
  onConfirm,
}) => {
  const { t, ready } = useTranslation('common');

  if (!ready || !action) return null;

  const modalConfig = {
    delete: {
      title: t('oscrat.ui.delete-version'),
      text: t('oscrat.ui.delete-version-confirmation', { versionName }),
      continueButtonText: t('delete'),
    },
    withdraw: {
      title: t('oscrat.ui.withdraw-version'),
      text: t('oscrat.ui.withdraw-version-confirmation', { versionName }),
      continueButtonText: t('oscrat.ui.withdraw'),
    },
  };

  const config = modalConfig[action];

  const handleConfirm = () => {
    onClose();
    onConfirm();
  };

  return (
    <FullScreenModal
      isOpen={isOpen}
      onClose={onClose}
      title={config.title}
      text={config.text}
      cancelButtonText={t('cancel')}
      continueButtonText={config.continueButtonText}
      onCancel={onClose}
      onContinue={handleConfirm}
    />
  );
};

export default VersionActionModal;

