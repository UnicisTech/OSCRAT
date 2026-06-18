import { HTMLAttributes, ReactNode } from 'react';

export type AlertStatus = 'info' | 'success' | 'warning' | 'error';

const statusStyles: Record<AlertStatus, string> = {
  info: 'bg-info-subtle text-info-emphasis border-info-border',
  success: 'bg-success-subtle text-success-emphasis border-success-border',
  warning: 'bg-warning-subtle text-warning-emphasis border-warning-border',
  error: 'bg-danger-subtle text-danger-emphasis border-danger-border',
};

interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  status?: AlertStatus;
  children?: ReactNode;
}

const Alert = ({
  status = 'info',
  className = '',
  children,
  ...rest
}: AlertProps) => {
  return (
    <div
      role="alert"
      className={`rounded-card border px-4 py-3 ${statusStyles[status]} ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
};

export default Alert;
