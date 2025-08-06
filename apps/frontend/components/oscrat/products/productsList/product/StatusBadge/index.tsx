import React from 'react';
import { BsExclamationCircleFill } from 'react-icons/bs';
import { getBorderClass } from '@/lib/borderUtils';

interface StatusBadgeProps {
  count: number;
  displayText: string;
  ariaLabel: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({
  count,
  displayText,
  ariaLabel,
}) => {
  const hasIssues = count > 0;

  return (
    <div
      className={`inline-flex items-center gap-2 font-semibold text-black dark:text-gray-100`}
      role="status"
      aria-label={ariaLabel}
    >
      {hasIssues ? (
        <div
          className={`flex items-center gap-2 rounded-full border px-2 py-0.5 ${getBorderClass(count)}`}
        >
          <BsExclamationCircleFill
            className="text-red-600"
            aria-hidden="true"
          />
          <span>{displayText}</span>
        </div>
      ) : (
        <span
          className={`rounded-full border border-gray-400 px-2 py-0.5 ${getBorderClass(count)}`}
        >
          {displayText}
        </span>
      )}
    </div>
  );
};

export default StatusBadge;
