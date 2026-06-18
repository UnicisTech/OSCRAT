import { ReactNode } from 'react';

export type BadgeColor =
  | 'primary'
  | 'secondary'
  | 'accent'
  | 'info'
  | 'success'
  | 'warning'
  | 'error'
  | 'neutral'
  | 'ghost';

// Semantic-token styles per colour (replaces the old daisyUI Badge).
export const badgeColorStyles: Record<BadgeColor, string> = {
  primary: 'bg-primary text-content-inverse',
  secondary: 'bg-surface-inverse text-content-inverse',
  accent: 'bg-primary text-content-inverse',
  info: 'bg-info text-content-inverse',
  success: 'bg-success text-content-inverse',
  warning: 'bg-warning text-content-inverse',
  error: 'bg-danger text-content-inverse',
  neutral: 'bg-surface-inverse text-content-inverse',
  ghost: 'bg-surface-muted text-content-secondary',
};

interface BadgeProps {
  children?: ReactNode;
  color?: BadgeColor;
  className?: string;
}

const Badge = ({ children, color = 'ghost', className = '' }: BadgeProps) => {
  return (
    <span
      className={`rounded-card inline-flex items-center whitespace-nowrap px-2.5 py-1 text-xs font-medium ${badgeColorStyles[color]} ${className}`}
    >
      {children}
    </span>
  );
};

export default Badge;
