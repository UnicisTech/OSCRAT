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
import Button from '@/components/button';
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

  const acceptInvitation = async () => {
    if (!invitation) return;

    try {
      await acceptInvitationMutation({ token: invitation.token });
      toast.success(t('oscrat.ui.invitation-accepted'));
      router.push(`/organization`);
    } catch (error: unknown) {
      toast.error(
        extractErrorMessage(error, t('oscrat.ui.failed-to-accept-invitation'))
      );
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  if (error || !invitation) {
    return (
      <Error
        message={(error as any)?.message || t('oscrat.ui.invitation-not-found')}
      />
    );
  }

  const emailMatch = data?.user?.email === invitation.email;

  return (
    <>
      <Head>
        <title>{`${t('invitation-title')} ${invitation.team.name}`}</title>
      </Head>
      <div className="border-line bg-surface shadow-8 rounded border-2 p-6">
        <div className="flex flex-col items-center space-y-6">
          <h2 className="text-content text-xl font-bold">
            {`${invitation.team.name} ${t('team-invite')}`}
          </h2>

          {/* User not authenticated */}
          {status === 'unauthenticated' && (
            <>
              <h3 className="text-content text-center text-base">
                {t('invite-create-account')}
              </h3>
              <Button
                variant="secondary"
                fullWidth
                onClick={() => {
                  router.push(`/auth/join?token=${invitation.token}`);
                }}
              >
                {t('create-a-new-account')}
              </Button>
              <Button
                variant="secondary"
                fullWidth
                onClick={() => {
                  router.push(`/auth/login?token=${invitation.token}`);
                }}
              >
                {t('login')}
              </Button>
            </>
          )}

          {/* User authenticated and email matches */}
          {status === 'authenticated' && emailMatch && (
            <>
              <h3 className="text-content text-center text-base">
                {t('accept-invite')}
              </h3>
              <Button
                onClick={acceptInvitation}
                fullWidth
                variant="primary"
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
              <p className="text-content-secondary text-center text-sm">{`${t('oscrat.ui.email-mismatch-1')} ${data?.user?.email} ${t('oscrat.ui.email-mismatch-2')}`}</p>
              <p className="text-content-secondary text-center text-sm">
                {t('oscrat.ui.email-mismatch-instructions')}
              </p>
              <Button
                fullWidth
                tone="danger"
                variant="secondary"
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
