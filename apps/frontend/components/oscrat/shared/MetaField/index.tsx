import React, { ReactNode } from 'react';

interface MetaFieldProps {
  label: string;
  /** Plain text value; ignored when `children` is provided. */
  value?: ReactNode;
  /** Custom value content (e.g. a chip or paragraph). */
  children?: ReactNode;
  className?: string;
}

/**
 * Label + value column used in the product / version detail cards. Matches the
 * Figma metadata field: C1 label, 4px gap, bold B2 value.
 */
const MetaField: React.FC<MetaFieldProps> = ({
  label,
  value,
  children,
  className = '',
}) => (
  <div className={`flex flex-col gap-1 ${className}`}>
    <span className="text-content-secondary text-c1">{label}</span>
    {/* Fixed-height, vertically-centred slot so plain-text values and pills
        share a common baseline across columns. */}
    <div className="flex min-h-[1.75rem] items-center">
      {children ?? (
        <span className="text-b2 text-content font-medium">{value}</span>
      )}
    </div>
  </div>
);

export default MetaField;
