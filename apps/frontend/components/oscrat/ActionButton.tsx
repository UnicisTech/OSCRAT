import React from 'react';
import Button from '@/components/button';

interface ActionButtonProps {
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  icon: React.ReactNode;
  children: React.ReactNode;
  title?: string;
}

/**
 * Compact table/toolbar action button — a thin domain wrapper over the
 * canonical Button (secondary, small) so all buttons share one styling source.
 */
const ActionButton: React.FC<ActionButtonProps> = ({
  onClick,
  disabled = false,
  icon,
  children,
  title,
}) => {
  return (
    <Button
      variant="secondary"
      size="s"
      onClick={onClick}
      disabled={disabled}
      title={title}
      startIcon={icon}
    >
      {children}
    </Button>
  );
};

export default ActionButton;
