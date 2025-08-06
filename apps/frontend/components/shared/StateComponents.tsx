import React from 'react';
import { useTranslation } from 'next-i18next';

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message }: LoadingStateProps) {
  const { t } = useTranslation('common');

  return (
    <div className="flex w-full flex-col justify-center">
      <p className="py-4 text-center dark:text-gray-300">
        {message || t('loading-project-details')}
      </p>
    </div>
  );
}

interface ErrorStateProps {
  message?: string;
}

export function ErrorState({ message }: ErrorStateProps) {
  const { t } = useTranslation('common');

  return (
    <div className="flex w-full flex-col justify-center">
      <p className="py-4 text-center text-red-500 dark:text-red-400">
        {message || t('unknown-error')}
      </p>
    </div>
  );
}

interface EmptyStateProps {
  message?: string;
}

export function EmptyState({ message }: EmptyStateProps) {
  const { t } = useTranslation('common');

  return (
    <p className="py-4 text-center dark:text-gray-300">
      {message || t('no-projects-found')}
    </p>
  );
}
