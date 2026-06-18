import { signOut } from 'next-auth/react';
import { ArrowLeftStartOnRectangleIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'next-i18next';

import { Card } from '@/components/shared';
import Button from '@/components/button';

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
        <Button
          type="button"
          tone="danger"
          variant="secondary"
          onClick={handleSignOut}
          startIcon={<ArrowLeftStartOnRectangleIcon className="h-4 w-4" />}
        >
          {t('sign-out')}
        </Button>
      </Card.Footer>
    </Card>
  );
};

export default SignOut;
