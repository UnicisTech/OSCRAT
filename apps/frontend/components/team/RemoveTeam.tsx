import { Card } from '@/components/shared';
import { Team } from '@oscrat/model';
import { useTranslation } from 'next-i18next';
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import Button from '@/components/button';
import { useTeam } from '@/hooks/useTeam';
import { extractErrorMessage } from '@/lib/utils';

import ConfirmationDialog from '../shared/ConfirmationDialog';
import { useRouter } from 'next/router';

const RemoveTeam = ({ team }: { team: Team }) => {
  const { t } = useTranslation('common');
  const [askConfirmation, setAskConfirmation] = useState(false);
  const { deleteTeam, isLoading } = useTeam(team.slug);
  const router = useRouter();

  const removeTeam = async () => {
    try {
      await deleteTeam();
      router.replace('/organization');
      toast.success(t('team-removed-successfully'));
    } catch (error: unknown) {
      toast.error(extractErrorMessage(error, t('an-error-occurred')));
    }
  };

  return (
    <>
      <Card>
        <Card.Body>
          <Card.Header>
            <Card.Title>{t('remove-team')}</Card.Title>
            <Card.Description>{t('remove-team-warning')}</Card.Description>
          </Card.Header>
        </Card.Body>
        <Card.Footer>
          <Button
            tone="danger"
            variant="secondary"
            onClick={() => setAskConfirmation(true)}
            loading={isLoading}
          >
            {t('remove-team')}
          </Button>
        </Card.Footer>
      </Card>
      <ConfirmationDialog
        visible={askConfirmation}
        title={t('remove-team')}
        onCancel={() => setAskConfirmation(false)}
        onConfirm={removeTeam}
      >
        {t('remove-team-confirmation')}
      </ConfirmationDialog>
    </>
  );
};

export default RemoveTeam;
