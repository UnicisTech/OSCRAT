/**
 * Background colour classes for an Oscrat product-version status pill.
 * Shared by the version detail header and the version summary rows.
 */
const STATUS_COLORS: Record<string, string> = {
  DRAFT: 'bg-caution-subtle', // yellow — not yet finalised
  ACTIVE: 'bg-success-subtle', // green — live & healthy
  SUPPORTED: 'bg-info-subtle', // blue — maintained
  DEPRECATED: 'bg-warning-subtle', // orange — being phased out
  ARCHIVED: 'bg-surface-muted', // grey — dormant / inactive
  WITHDRAWN: 'bg-danger-subtle', // red — pulled / removed
  DEFAULT: 'bg-surface-muted',
};

export const getStatusColorClass = (status: string): string =>
  STATUS_COLORS[status] || STATUS_COLORS.DEFAULT;
