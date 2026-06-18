import React, { ReactNode } from 'react';

interface SuccessBadgeProps {
  label: string;
  /** Optional leading icon. */
  icon?: ReactNode;
  className?: string;
}

/**
 * Success-toned pill (e.g. "Ready for market", "Signed"). Shared by the doc
 * section header and the document display row.
 */
const SuccessBadge: React.FC<SuccessBadgeProps> = ({
  label,
  icon,
  className = '',
}) => (
  <span
    className={`bg-success-subtle text-success-emphasis inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${className}`}
  >
    {icon}
    {label}
  </span>
);

export default SuccessBadge;
