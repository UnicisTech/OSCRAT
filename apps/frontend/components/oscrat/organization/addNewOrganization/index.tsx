import React from 'react';
import { useTranslation } from 'next-i18next';
import CreateTeam from '@/components/auth/CreateTeam';
import Button from '@/components/button';

const OrganizationForm = ({ visible, setVisible }) => {
  const { t, ready } = useTranslation('common');

  if (!ready) return null;
  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 !mt-0 flex items-center justify-center bg-black bg-opacity-75 p-4">
      <div className="border-line-subtle bg-surface shadow-8 rounded-card relative max-h-[90vh] w-full max-w-2xl overflow-y-auto border p-6 sm:p-8">
        {/* Close button */}
        <Button
          variant="tertiary"
          size="l"
          onClick={() => setVisible(false)}
          className="absolute right-4 top-4"
          aria-label={t('close')}
          icon={
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          }
        />

        <CreateTeam onClose={() => setVisible(false)} />
      </div>
    </div>
  );
};

export default OrganizationForm;
