import { useTranslation } from 'next-i18next';
import { FullScreenModal } from '@/components/shared';
import React from 'react';

interface ProductActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  action: 'delete' | 'withdraw' | 'details' | null;
  productName: string;
  productDescription?: string;
  onDelete?: () => void;
  onWithdraw?: () => void;
}

const ProductActionModal: React.FC<ProductActionModalProps> = ({
  isOpen,
  onClose,
  action,
  productName,
  productDescription,
  onDelete,
  onWithdraw,
}) => {
  const { t, ready } = useTranslation('common');

  const getModalContent = () => {
    switch (action) {
      case 'delete':
        return {
          title: t('oscrat.ui.delete-product'),
          text: t('oscrat.ui.delete-product-confirmation', {
            productName,
          }),
          continueButtonText: t('delete'),
          onContinue: () => {
            onClose();
            onDelete?.();
          },
        };
      case 'withdraw':
        return {
          title: t('oscrat.ui.withdraw-product'),
          text: t('oscrat.ui.withdraw-product-confirmation', {
            productName,
          }),
          continueButtonText: t('oscrat.ui.withdraw'),
          onContinue: () => {
            onClose();
            onWithdraw?.();
          },
        };
      case 'details':
        return {
          title: t('oscrat.ui.product-details'),
          text: productDescription,
          continueButtonText: t('oscrat.ui.close'),
          onContinue: onClose,
        };
      default:
        return {
          title: t('oscrat.ui.product-details'),
          text: productDescription,
          continueButtonText: t('oscrat.ui.close'),
          onContinue: onClose,
        };
    }
  };

  const modalContent = getModalContent();

  if (!ready) return null;

  return (
    <FullScreenModal
      isOpen={isOpen}
      onClose={onClose}
      title={modalContent.title}
      text={modalContent.text}
      cancelButtonText={t('cancel')}
      continueButtonText={modalContent.continueButtonText}
      onCancel={onClose}
      onContinue={modalContent.onContinue}
    />
  );
};

export default ProductActionModal;
