import React from 'react';

interface ActionButtonProps {
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  icon: React.ReactNode;
  children: React.ReactNode;
  title?: string;
}

const ActionButton: React.FC<ActionButtonProps> = ({
  onClick,
  disabled = false,
  icon,
  children,
  title,
}) => {
  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={`inline-flex items-center rounded-md border border-gray-300 bg-white px-2 py-1.5 text-xs font-medium ${
        disabled
          ? 'cursor-not-allowed text-gray-400 opacity-50'
          : 'cursor-pointer text-gray-700 hover:bg-gray-50'
      }`}
      title={title}
    >
      <span className="mr-1">{icon}</span>
      {children}
    </button>
  );
};

export default ActionButton;
