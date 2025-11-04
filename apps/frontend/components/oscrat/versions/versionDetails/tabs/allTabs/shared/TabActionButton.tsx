import React from 'react';

interface TabActionButtonProps {
  onClick?: () => void;
  disabled?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
  title?: string;
  variant?: 'primary' | 'icon-only';
}

const TabActionButton: React.FC<TabActionButtonProps> = ({
  onClick,
  disabled = false,
  icon,
  children,
  title,
  variant = 'primary',
}) => {
  const baseClasses = 'inline-flex items-center rounded-md border bg-white text-sm font-medium leading-5 hover:bg-gray-50';
  const justifyClass = variant === 'icon-only' ? 'justify-center' : '';

  const variantClasses = {
    primary: 'border-gray-300 px-4 py-2 text-gray-900',
    'icon-only': 'border-gray-300 px-2.5 py-2 text-gray-700',
  };

  const disabledClasses = disabled
    ? 'cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400'
    : variantClasses[variant];

  const className = `${baseClasses} ${justifyClass} ${disabledClasses}`;

  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={className}
      title={title}
    >
      {icon && (
        <span className={variant !== 'icon-only' && children ? 'mr-2' : ''}>
          <span className="flex h-5 w-5 items-center justify-center">{icon}</span>
        </span>
      )}
      {children}
    </button>
  );
};

export default TabActionButton;
