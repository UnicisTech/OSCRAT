import React from 'react';
import { OscratProductStatus } from '@oscrat/model';

const CheckCircleIcon = ({
  className = 'w-5 h-5 text-success',
}: {
  className?: string;
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const BannedIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
    />
  </svg>
);

interface StatusBadgeProps {
  status: OscratProductStatus;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const statusConfig = {
    [OscratProductStatus.ACTIVE]: {
      bgColor: 'bg-success-subtle',
      textColor: 'text-content',
      Icon: CheckCircleIcon,
      label: 'Active',
    },
    [OscratProductStatus.INACTIVE]: {
      bgColor: 'bg-surface-muted',
      textColor: 'text-content',
      Icon: BannedIcon,
      label: 'Inactive',
    },
  };

  const { bgColor, textColor, Icon, label } = statusConfig[status];

  return (
    <div
      className={`inline-flex items-center gap-x-2 rounded-full px-3 py-1 text-sm font-medium ${bgColor} ${textColor} `}
    >
      <Icon />
      <span>{label}</span>
    </div>
  );
};

export default StatusBadge;
