import React from 'react';
import { BsExclamationCircleFill } from 'react-icons/bs';
import { getBorderClass } from '@/lib/borderUtils';

interface CountChipProps {
  /** Item count; drives the border colour and whether the icon shows. */
  count: number;
  /** Text inside the chip, e.g. "3 open" or "None". */
  displayText: string;
  /** Icon colour class. Defaults to danger; tasks pass `text-primary`. */
  iconClassName?: string;
  ariaLabel?: string;
}

/**
 * Pill showing an item count. When `count > 0` it renders a warning icon and a
 * coloured border; otherwise a plain neutral pill with the label flush-left
 * (no reserved icon slot). Shared by the product / version cards and the
 * version summary rows.
 */
const CountChip: React.FC<CountChipProps> = ({
  count,
  displayText,
  iconClassName = 'text-danger',
  ariaLabel,
}) => {
  const hasIssues = count > 0;

  return (
    <div
      className={`text-content inline-flex items-center gap-2 rounded-full border px-2 py-0.5 font-medium tabular-nums ${getBorderClass(count)}`}
      role="status"
      aria-label={ariaLabel}
    >
      {hasIssues && (
        <BsExclamationCircleFill
          className={iconClassName}
          aria-hidden="true"
        />
      )}
      <span>{displayText}</span>
    </div>
  );
};

export default CountChip;
