import React from 'react';
import { ButtonHTMLAttributes, MouseEvent } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';

type ButtonProps = {
  text: string;
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
  variant: ButtonVariant;
  className?: string;
  disabled?: boolean;
  fullWidth?: boolean;
} & ButtonHTMLAttributes<HTMLButtonElement>;

const Button: React.FC<ButtonProps> = ({
  text,
  onClick,
  variant,
  className = '',
  disabled = false,
  fullWidth = false,
}) => {
  const baseClasses = fullWidth
    ? 'w-full rounded-md px-2 py-3 text-sm font-medium transition-colors duration-200'
    : 'rounded-md px-2 py-1 text-sm font-medium transition-colors duration-200';

  const variantClasses = {
    primary:
      'bg-primary-default text-white hover:bg-blue-800 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed',
    secondary:
      'bg-white text-gray-800 border border-gray-300 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 focus:ring-blue-300 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-blue-900 dark:hover:border-blue-600 dark:hover:text-blue-300 dark:focus:ring-blue-600 dark:disabled:bg-gray-800 dark:disabled:text-gray-500',
    ghost:
      'bg-transparent text-gray-800 disabled:text-gray-400 disabled:cursor-not-allowed dark:text-gray-300 dark:disabled:text-gray-500',
  };

  const buttonClasses = `${baseClasses} ${variantClasses[variant]} !${className}`;

  return (
    <button onClick={onClick} className={buttonClasses} disabled={disabled}>
      {text}
    </button>
  );
};

export default Button;
