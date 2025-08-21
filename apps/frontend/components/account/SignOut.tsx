import { signOut } from 'next-auth/react';
import { ArrowLeftStartOnRectangleIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'next-i18next';

import { Card } from '@/components/shared';

const SignOut = () => {
  const { t, ready } = useTranslation('common');

  const handleSignOut = () => {
    signOut({ callbackUrl: '/auth/login' });
  };

  if (!ready) {
    return null;
  }

  return (
    <Card>
      <Card.Body>
        <Card.Header>
          <Card.Title>{t('account-actions')}</Card.Title>
          <Card.Description>{t('sign-out-description')}</Card.Description>
        </Card.Header>
      </Card.Body>
      <Card.Footer>
        <button
          type="button"
          onClick={handleSignOut}
          className="inline-flex items-center gap-2 rounded-md border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-600 hover:border-red-400 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-600 dark:bg-gray-800 dark:text-red-400 dark:hover:border-red-500 dark:hover:bg-red-900/20"
        >
          <ArrowLeftStartOnRectangleIcon className="h-4 w-4" />
          {t('sign-out')}
        </button>
      </Card.Footer>
    </Card>
  );
};

export default SignOut;
