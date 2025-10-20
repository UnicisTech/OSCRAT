import React from 'react';
import { useTranslation } from 'next-i18next';
import CreateTeam from '@/components/auth/CreateTeam';

const OrganizationForm = ({ visible, setVisible }) => {
  const { t, ready } = useTranslation('common');

  if (!ready) return null;
  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 !mt-0 flex items-center justify-center bg-black bg-opacity-75 p-4">
      <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-gray-200 bg-white p-6 shadow-lg sm:p-8">
        {/* Close button */}
        <button
          onClick={() => setVisible(false)}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
          aria-label={t('close')}
        >
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
        </button>

        <CreateTeam onClose={() => setVisible(false)} />
      </div>
    </div>
  );
};

export default OrganizationForm;
