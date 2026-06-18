import React from 'react';
import { getStatusColorClass } from '@/lib/statusColors';

interface StatusPillProps {
  /** Product-version status, drives the background colour. */
  status: string;
  /** Translated, human-readable label. */
  label: string;
  className?: string;
}

/**
 * Coloured status pill for a product version (Active / Archived / …). Shared by
 * the version detail header and the version summary rows.
 */
const StatusPill: React.FC<StatusPillProps> = ({
  status,
  label,
  className = '',
}) => (
  <span
    className={`text-content inline-flex w-fit rounded-full px-2 py-0.5 text-sm font-medium capitalize ${getStatusColorClass(status)} ${className}`}
  >
    {label}
  </span>
);

export default StatusPill;
