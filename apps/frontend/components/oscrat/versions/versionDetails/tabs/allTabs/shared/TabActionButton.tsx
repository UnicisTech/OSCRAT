import React from 'react';
import Button from '@/components/button';

interface TabActionButtonProps {
  onClick?: () => void;
  disabled?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
  title?: string;
  variant?: 'primary' | 'secondary' | 'icon-only';
}

/**
 * Tab toolbar action button — a thin domain wrapper over the canonical Button
 * (secondary, medium) so all buttons share one styling source. The legacy
 * `variant` values all map onto the outlined secondary style; `icon-only`
 * renders a square icon button.
 */
const TabActionButton: React.FC<TabActionButtonProps> = ({
  onClick,
  disabled = false,
  icon,
  children,
  title,
  variant = 'primary',
}) => {
  const iconOnly = variant === 'icon-only';

  return (
    <Button
      variant="secondary"
      size="m"
      onClick={onClick}
      disabled={disabled}
      title={title}
      icon={iconOnly ? icon : undefined}
      startIcon={iconOnly ? undefined : icon}
    >
      {iconOnly ? undefined : children}
    </Button>
  );
};

export default TabActionButton;
