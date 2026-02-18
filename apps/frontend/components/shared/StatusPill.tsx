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

export default StatusPill;
