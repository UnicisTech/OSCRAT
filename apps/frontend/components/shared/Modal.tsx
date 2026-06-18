import React, { useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import Button from '@/components/button';

/**
 * The single dialog primitive for the app. Renders the shared chrome
 * (surface, rounded-card, shadow-24, header/body/footer with dividers) so
 * every modal looks identical — consumers only provide the content via
 * Modal.Header / Modal.Body / Modal.Footer and pick a `size`.
 */
export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl';

const SIZE_MAP: Record<ModalSize, string> = {
  sm: 'max-w-md', // confirmations / tiny forms
  md: 'max-w-[600px]', // default dialog width (design spec)
  lg: 'max-w-2xl', // standard forms
  xl: 'max-w-3xl', // viewers
  '2xl': 'max-w-4xl', // large multi-section forms
};

interface ModalProps {
  open: boolean;
  close?: () => void;
  size?: ModalSize;
  closeOnBackdrop?: boolean;
  className?: string;
  children: React.ReactNode;
}

interface BodyProps {
  children: React.ReactNode;
  className?: string;
}

const Modal = ({
  open,
  close,
  size = 'md',
  closeOnBackdrop = true,
  className = '',
  children,
}: ModalProps) => {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close?.();
    };
    document.addEventListener('keydown', onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, close]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={
        closeOnBackdrop && close
          ? (e) => {
              if (e.target === e.currentTarget) close();
            }
          : undefined
      }
    >
      <div
        role="dialog"
        aria-modal="true"
        className={`bg-surface rounded-card shadow-24 text-content relative flex max-h-[90vh] w-full flex-col ${SIZE_MAP[size]} ${className}`}
      >
        {close && (
          <Button
            type="button"
            variant="tertiary"
            size="m"
            className="rounded-input absolute right-3 top-2 z-10"
            onClick={close}
            aria-label="close"
            icon={<XMarkIcon className="text-content-secondary h-6 w-6" />}
          />
        )}
        {children}
      </div>
    </div>
  );
};

// Header bar — Bold/B2 title with a bottom divider (close button lives in Modal).
const Header = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="border-line-subtle text-b2 text-content flex h-14 flex-shrink-0 items-center border-b pl-6 pr-3 font-bold">
      {children}
    </div>
  );
};

const Description = ({ children }: { children: React.ReactNode }) => {
  return <p className="text-content-secondary text-c1 px-6 pt-4">{children}</p>;
};

const Body = ({ children, className }: BodyProps) => {
  return (
    <div
      className={`text-content flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-6 py-4 ${className || ''}`}
    >
      {children}
    </div>
  );
};

const Footer = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="border-line-subtle flex h-16 flex-shrink-0 items-center justify-end gap-3 border-t px-6">
      {children}
    </div>
  );
};

Modal.Header = Header;
Modal.Description = Description;
Modal.Body = Body;
Modal.Footer = Footer;

export default Modal;
