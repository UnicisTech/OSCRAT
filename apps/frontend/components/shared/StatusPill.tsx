import React from 'react';

interface StatusPillProps {
  label: string;
  className?: string;
}

const StatusPill: React.FC<StatusPillProps> = ({ label, className = '' }) => {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${className}`}
    >
      {label}
    </span>
  );
};

export const VULNERABILITY_STATUS_CLASSES: Record<string, string> = {
  Pending: 'bg-warning-subtle text-warning-emphasis',
  Active: 'bg-info-subtle text-info-emphasis',
  Closed: 'bg-surface-muted text-content',
};

export default StatusPill;
