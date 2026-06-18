import React from 'react';
import Button from '@/components/button';
import Modal from './Modal';

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

/**
 * Thin wrapper over the shared Modal that keeps the title/text/cancel/continue
 * convenience API used across product & version actions. All chrome/styling
 * comes from the shared Modal primitive.
 */
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
  return (
    <Modal open={isOpen} close={onClose} size="sm">
      <Modal.Header>{title}</Modal.Header>
      <Modal.Body>
        {text && <p className="text-content-secondary text-b2">{text}</p>}
        {children}
      </Modal.Body>
      <Modal.Footer>
        <Button
          text={cancelButtonText}
          onClick={onCancel || onClose}
          variant="tertiary"
        />
        <Button
          text={continueButtonText}
          onClick={onContinue}
          variant="primary"
        />
      </Modal.Footer>
    </Modal>
  );
};

export default FullScreenModal;
