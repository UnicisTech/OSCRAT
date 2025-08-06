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
  ...rest
}: ButtonProps) {
  const variantStyles = {
    primary: 'bg-blue-600 text-white hover:bg-blue-600',
    normal: 'bg-transparent text-black hover:text-black border border-gray-300',
  };

  return (
    <button
      onClick={(e) => onClick(e)}
      className={`rounded px-4 py-2 ${variantStyles[variant]} ${className}`}
      {...rest}
    >
      {text}
    </button>
  );
}
