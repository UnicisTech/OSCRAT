import { AuthLayout } from '@/components/layouts';
import { Error, Loading } from '@/components/shared';
import { useInvitation } from 'hooks/useInvitation';
import { useAcceptInvitation } from '@/lib/api/hooks/invitations';
import type { GetServerSidePropsContext } from 'next';
import { useSession, signOut } from 'next-auth/react';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Head from 'next/head';
import { useRouter } from 'next/router';
import type { ReactElement } from 'react';
import { Button } from 'react-daisyui';
import toast from 'react-hot-toast';
import type { NextPageWithLayout } from 'types';
import { extractErrorMessage } from '@/lib/utils';

const AcceptTeamInvitation: NextPageWithLayout = () => {
  const { status, data } = useSession();
  const router = useRouter();
  const { t } = useTranslation('common');
  const { isLoading, error, invitation } = useInvitation();
  const { mutateAsync: acceptInvitationMutation, isPending } =
    useAcceptInvitation();

  if (isLoading) {
    return <Loading />;
  }

  if (error || !invitation) {
    return <Error message={error?.message || t('invitation-not-found')} />;
  }

  const acceptInvitation = async () => {
    try {
      await acceptInvitationMutation({ token: invitation.token });
      toast.success(t('invitation-accepted'));
      router.push(`/teams`);
    } catch (error: unknown) {
      toast.error(extractErrorMessage(error, t('failed-to-accept-invitation')));
    }
  };

  const emailMatch = data?.user?.email === invitation.email;

  return (
    <>
      <Head>
        <title>{`${t('invitation-title')} ${invitation.team.name}`}</title>
      </Head>
      <div className="rounded p-6 border">
        <div className="flex flex-col items-center space-y-6">
          <h2 className="font-bold">
            {`${invitation.team.name} ${t('team-invite')}`}
          </h2>

          {/* User not authenticated */}
          {status === 'unauthenticated' && (
            <>
              <h3 className="text-center">{t('invite-create-account')}</h3>
              <Button
                variant="outline"
                fullWidth
                onClick={() => {
                  router.push(`/auth/join?token=${invitation.token}`);
                }}
                size="md"
              >
                {t('create-a-new-account')}
              </Button>
              <Button
                variant="outline"
                fullWidth
                onClick={() => {
                  router.push(`/auth/login?token=${invitation.token}`);
                }}
                size="md"
              >
                {t('login')}
              </Button>
            </>
          )}

          {/* User authenticated and email matches */}
          {status === 'authenticated' && emailMatch && (
            <>
              <h3 className="text-center">{t('accept-invite')}</h3>
              <Button
                onClick={acceptInvitation}
                fullWidth
                color="primary"
                size="md"
                loading={isPending}
                disabled={isPending}
              >
                {t('accept-invitation')}
              </Button>
            </>
          )}

          {/* User authenticated and email does not match */}
          {status === 'authenticated' && !emailMatch && (
            <>
              <p className="text-sm text-center">{`${t('email-mismatch-1')} ${data?.user?.email} ${t('email-mismatch-2')}`}</p>
              <p className="text-sm text-center">
                {t('email-mismatch-instructions')}
              </p>
              <Button
                fullWidth
                color="error"
                size="md"
                variant="outline"
                onClick={() => {
                  signOut();
                }}
              >
                {t('sign-out')}
              </Button>
            </>
          )}
        </div>
      </div>
    </>
  );
};

AcceptTeamInvitation.getLayout = function getLayout(page: ReactElement) {
  return <AuthLayout>{page}</AuthLayout>;
};

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const { locale } = context;

  return {
    props: {
      ...(locale ? await serverSideTranslations(locale, ['common']) : {}),
    },
  };
};

export default AcceptTeamInvitation;
