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
  Pending: 'bg-yellow-100 text-yellow-800',
  Active: 'bg-blue-100 text-blue-800',
  Closed: 'bg-gray-100 text-gray-800',
};

export default StatusPill;
