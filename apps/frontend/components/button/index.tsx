import { ButtonHTMLAttributes, MouseEvent } from 'react';

type ButtonProps = {
  onClick: (e: MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  text: string;
  variant?: 'primary' | 'normal';
} & ButtonHTMLAttributes<HTMLButtonElement>;

export default function Button({
  onClick,
  className = '',
  variant = 'normal',
  text,
  disabled,
  ...rest
}: ButtonProps) {
  const variantStyles = {
    primary: disabled 
      ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
      : 'bg-blue-600 text-white hover:bg-blue-700',
    normal: disabled
      ? 'bg-gray-100 text-gray-400 border border-gray-300 cursor-not-allowed'
      : 'bg-transparent text-black hover:text-black border border-gray-300 hover:bg-gray-50',
  };

  return (
    <button
      onClick={disabled ? undefined : (e) => onClick(e)}
      className={`rounded px-4 py-2 transition-colors ${variantStyles[variant]} ${className}`}
      disabled={disabled}
      {...rest}
    >
      {text}
    </button>
  );
}
