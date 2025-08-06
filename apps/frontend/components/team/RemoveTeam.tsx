import { Card } from '@/components/shared';
import { Team } from '@oscrat/model';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import { Button } from 'react-daisyui';
import toast from 'react-hot-toast';
import { useTeam } from '@/hooks/useTeam';
import { extractErrorMessage } from '@/lib/utils';

import ConfirmationDialog from '../shared/ConfirmationDialog';

const RemoveTeam = ({ team }: { team: Team }) => {
  const router = useRouter();
  const { t } = useTranslation('common');
  const [askConfirmation, setAskConfirmation] = useState(false);
  const { deleteTeam, isLoading } = useTeam(team.slug);

  const removeTeam = async () => {
    try {
      await deleteTeam();
      toast.success(t('team-removed-successfully'));
      router.push('/teams');
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
            color="error"
            onClick={() => setAskConfirmation(true)}
            loading={isLoading}
            variant="outline"
            size="md"
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
