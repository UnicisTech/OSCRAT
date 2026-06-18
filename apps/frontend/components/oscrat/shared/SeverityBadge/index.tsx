import React from 'react';

interface SeverityBadgeProps {
  /** Severity key (LOW / MEDIUM / HIGH / CRITICAL) — drives the colour. */
  severity: string;
  /** Translated, human-readable label. */
  label: string;
}

const SEVERITY_CLASSES: Record<string, string> = {
  LOW: 'border-content-muted text-content',
  MEDIUM: 'border-warning text-content',
  HIGH: 'border-danger text-content',
  CRITICAL: 'border-danger text-content',
};

/**
 * Severity pill shared by the vulnerabilities and incidents tables.
 */
const SeverityBadge: React.FC<SeverityBadgeProps> = ({ severity, label }) => {
  const classes =
    SEVERITY_CLASSES[severity?.toUpperCase()] || SEVERITY_CLASSES.LOW;

  return (
    <span
      className={`inline-flex rounded-full border px-2 py-1 text-xs font-semibold ${classes}`}
    >
      {label}
    </span>
  );
};

export default SeverityBadge;
