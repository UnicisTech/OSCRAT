import InformationCircleIcon from '@heroicons/react/24/outline/InformationCircleIcon';
import React from 'react';

interface EmptyStateProps {
  title: string;
  description?: string;
}

const EmptyState = ({ title, description }: EmptyStateProps) => {
  return (
    <div className="bg-surface border-line rounded-card flex h-80 w-full flex-col items-center justify-center gap-2 border lg:p-20">
      <InformationCircleIcon className="h-10 w-10" />
      <h3 className="text-semibold text-emphasis text-center text-lg">
        {title}
      </h3>
      {description && (
        <p className="text-default text-center text-sm font-light leading-6">
          {description}
        </p>
      )}
    </div>
  );
};

export default EmptyState;
