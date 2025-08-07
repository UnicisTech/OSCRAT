import { CreateDirectory, Directory } from '@/components/directorySync';
import { Card } from '@/components/shared';
import { Error } from '@/components/shared';
import ConfirmationDialog from '@/components/shared/ConfirmationDialog';
import { TeamTab } from '@/components/team';
import { useDirectory } from 'hooks/useDirectory';
import { useTeamContext } from '@/context/TeamContext';
import { GetServerSidePropsContext } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import { Button } from 'react-daisyui';
import { toast } from 'react-hot-toast';
import type { NextPageWithLayout } from 'types';
import env from '@/lib/env';
import { getSession } from '@/lib/session';
import { getTeamMember } from '@/lib/middleware/teamAuth';
import { isAllowed } from '@/lib/middleware';
import { inferSSRProps } from '@/lib/inferSSRProps';
import TeamLayout from '@/components/layouts/TeamLayout';
import AccountLayout from '@/components/layouts/AccountLayout';

const DirectorySync: NextPageWithLayout<
  inferSSRProps<typeof getServerSideProps>
> = ({ teamFeatures, error }) => {
  const router = useRouter();
  const { slug } = router.query as { slug: string };

  const [visible, setVisible] = useState(false);
  const [confirmationDialogVisible, setConfirmationDialogVisible] =
    useState(false);
  const { teamContext } = useTeamContext();
  const team = teamContext.team!;
  const { directories, deleteDirectory } = useDirectory(slug);
  const { t } = useTranslation('common');

  if (error) {
    return <Error message={error.message} />;
  }

  const directory =
    directories && directories.length > 0 ? directories[0] : null;

  const removeDirectory = async () => {
    if (!directory) return;

    try {
      await deleteDirectory(directory.id);
      toast.success(t('directory-sync-deleted'));
    } catch (err: any) {
      toast.error(err.message || t('error-deleting-directory'));
    }
  };

  return (
    <>
      <TeamTab
        activeTab="directory-sync"
        team={team}
        teamFeatures={teamFeatures}
      />
      <Card>
        <Card.Body>
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm">{t('provision')}</p>
            {directory === null ? (
              <Button
                onClick={() => setVisible(!visible)}
                variant="outline"
                color="primary"
                size="md"
              >
                {t('configure')}
              </Button>
            ) : (
              <Button
                onClick={() => setConfirmationDialogVisible(true)}
                variant="outline"
                color="error"
                size="md"
              >
                {t('remove')}
              </Button>
            )}
          </div>
          <Directory team={team} />
        </Card.Body>
      </Card>
      <CreateDirectory visible={visible} setVisible={setVisible} team={team} />
      <ConfirmationDialog
        visible={confirmationDialogVisible}
        onCancel={() => setConfirmationDialogVisible(false)}
        onConfirm={removeDirectory}
        title={t('confirm-delete-directory-sync')}
      >
        {t('delete-directory-sync-warning')}
      </ConfirmationDialog>
    </>
  );
};

DirectorySync.getLayout = function getLayout(page: React.ReactNode) {
  return (
    <AccountLayout>
      <TeamLayout>{page}</TeamLayout>
    </AccountLayout>
  );
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const { locale, req, res, query } = context;

  if (!env.teamFeatures.dsync) {
    return {
      notFound: true,
    };
  }

  const session = await getSession(req, res);
  const teamMember = await getTeamMember(
    session?.user.id as string,
    query.slug as string
  );

  if (!teamMember) {
    return {
      notFound: true,
    };
  }

  try {
    if (!isAllowed(teamMember.role, 'team_dsync', 'read')) {
      return { notFound: true };
    }

    return {
      props: {
        ...(locale ? await serverSideTranslations(locale, ['common']) : {}),
        error: null,
        teamFeatures: env.teamFeatures,
      },
    };
  } catch (error: unknown) {
    const { message } = error as { message: string };

    return {
      props: {
        ...(locale ? await serverSideTranslations(locale, ['common']) : {}),
        error: {
          message,
        },
        teamFeatures: env.teamFeatures,
      },
    };
  }
}

export default DirectorySync;
