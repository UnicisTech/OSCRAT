import React from 'react';

interface AcronymBadgeProps {
  acronym: string;
  /** `md` for detail headers, `sm` for denser list cards. */
  size?: 'sm' | 'md';
}

const sizeClasses: Record<NonNullable<AcronymBadgeProps['size']>, string> = {
  sm: 'px-2 py-1 text-xs',
  md: 'px-2.5 py-1 text-sm',
};

/**
 * Info-toned pill showing a product acronym. Shared by the product detail
 * header and the product list cards.
 */
const AcronymBadge: React.FC<AcronymBadgeProps> = ({ acronym, size = 'md' }) => (
  <span
    className={`bg-info-subtle text-info-emphasis ring-info-emphasis/10 inline-flex items-center rounded-full font-medium ring-1 ring-inset ${sizeClasses[size]}`}
  >
    {acronym}
  </span>
);

export default AcronymBadge;
