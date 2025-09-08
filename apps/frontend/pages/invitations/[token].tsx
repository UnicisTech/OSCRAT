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


  const acceptInvitation = async () => {
    if (!invitation) return;
    
    try {
      await acceptInvitationMutation({ token: invitation.token });
      toast.success(t('oscrat.ui.invitation-accepted'));
      router.push(`/teams`);
    } catch (error: unknown) {
      toast.error(extractErrorMessage(error, t('oscrat.ui.failed-to-accept-invitation')));
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  if (error || !invitation) {
    return <Error message={(error as any)?.message || t('oscrat.ui.invitation-not-found')} />;
  }

  const emailMatch = data?.user?.email === invitation.email;

  return (
    <>
      <Head>
        <title>{`${t('invitation-title')} ${invitation.team.name}`}</title>
      </Head>
      <div className="rounded border-2 border-gray-300 bg-white p-6 shadow-lg">
        <div className="flex flex-col items-center space-y-6">
          <h2 className="font-bold text-xl text-gray-900">
            {`${invitation.team.name} ${t('team-invite')}`}
          </h2>

          {/* User not authenticated */}
          {status === 'unauthenticated' && (
            <>
              <h3 className="text-center text-base text-gray-800">{t('invite-create-account')}</h3>
              <Button
                variant="outline"
                fullWidth
                onClick={() => {
                  router.push(`/auth/join?token=${invitation.token}`);
                }}
                size="md"
                className="text-gray-800 border-gray-400 hover:text-gray-900 hover:border-gray-500 hover:bg-gray-50"
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
                className="text-gray-800 border-gray-400 hover:text-gray-900 hover:border-gray-500 hover:bg-gray-50"
              >
                {t('login')}
              </Button>
            </>
          )}

          {/* User authenticated and email matches */}
          {status === 'authenticated' && emailMatch && (
            <>
              <h3 className="text-center text-base text-gray-800">{t('accept-invite')}</h3>
              <Button
                onClick={acceptInvitation}
                fullWidth
                color="primary"
                size="md"
                loading={isPending}
                disabled={isPending}
                className="text-white font-medium"
              >
                {t('accept-invitation')}
              </Button>
            </>
          )}

          {/* User authenticated and email does not match */}
          {status === 'authenticated' && !emailMatch && (
            <>
              <p className="text-center text-sm text-gray-700">{`${t('oscrat.ui.email-mismatch-1')} ${data?.user?.email} ${t('oscrat.ui.email-mismatch-2')}`}</p>
              <p className="text-center text-sm text-gray-700">
                {t('oscrat.ui.email-mismatch-instructions')}
              </p>
              <Button
                fullWidth
                color="error"
                size="md"
                variant="outline"
                onClick={() => {
                  signOut();
                }}
                className="text-red-700 border-red-400 hover:text-red-800 hover:border-red-500 hover:bg-red-50 font-medium"
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
