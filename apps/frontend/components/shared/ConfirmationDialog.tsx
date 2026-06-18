import { useTranslation } from 'next-i18next';
import Button from '@/components/button';
import Modal from './Modal';

interface ConfirmationDialogProps {
  title: string;
  visible: boolean;
  onConfirm: () => void | Promise<any>;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  children: React.ReactNode;
}

const ConfirmationDialog = ({
  title,
  children,
  visible,
  onConfirm,
  onCancel,
  confirmText,
  cancelText,
}: ConfirmationDialogProps) => {
  const { t } = useTranslation('common');

  const handleConfirm = async () => {
    await onConfirm();
    onCancel();
  };

  return (
    <Modal open={visible} close={onCancel}>
      <Modal.Header>{title}</Modal.Header>
      <Modal.Body className="text-sm leading-6">{children}</Modal.Body>
      <Modal.Footer>
        <Button
          type="button"
          tone="danger"
          variant="primary"
          onClick={handleConfirm}
        >
          {confirmText || t('delete')}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          {cancelText || t('cancel')}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ConfirmationDialog;
