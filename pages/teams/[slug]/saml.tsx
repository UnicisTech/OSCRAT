import React from 'react';
import { Error } from '@/components/shared';
import { TeamTab } from '@/components/team';
import { ConnectionsWrapper } from '@boxyhq/react-ui/sso';
import { useTeamContext } from '@/context/TeamContext';
import { GetServerSidePropsContext } from 'next';
import toast from 'react-hot-toast';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import env from '@/lib/env';
import { BOXYHQ_UI_CSS } from '@/components/styles';
import { getSession } from '@/lib/session';
import { getTeamMember } from 'models/team';
import { throwIfNotAllowed } from 'models/user';
import { NextPageWithLayout } from 'types';
import { inferSSRProps } from '@/lib/inferSSRProps';
import TeamLayout from '@/components/layouts/TeamLayout';
import AccountLayout from '@/components/layouts/AccountLayout';

const TeamSSO: NextPageWithLayout<inferSSRProps<typeof getServerSideProps>> = ({
  teamFeatures,
  SPConfigURL,
  error,
}) => {
  const { teamContext } = useTeamContext();
  const team = teamContext.team!;

  if (error) {
    return <Error message={error.message} />;
  }

  return (
    <>
      <TeamTab activeTab="sso" team={team} teamFeatures={teamFeatures} />
      <ConnectionsWrapper
        urls={{
          spMetadata: SPConfigURL,
          get: `/api/teams/${team.slug}/sso`,
          post: `/api/teams/${team.slug}/sso`,
          patch: `/api/teams/${team.slug}/sso`,
          delete: `/api/teams/${team.slug}/sso`,
        }}
        successCallback={({
          operation,
          connectionIsSAML,
          connectionIsOIDC,
        }) => {
          const ssoType = connectionIsSAML
            ? 'SAML'
            : connectionIsOIDC
              ? 'OIDC'
              : '';
          if (operation === 'CREATE') {
            toast.success(`${ssoType} connection created successfully.`);
          } else if (operation === 'UPDATE') {
            toast.success(`${ssoType} connection updated successfully.`);
          } else if (operation === 'DELETE') {
            toast.success(`${ssoType} connection deleted successfully.`);
          } else if (operation === 'COPY') {
            toast.success(`Contents copied to clipboard`);
          }
        }}
        errorCallback={(errMessage) => toast.error(errMessage)}
        classNames={BOXYHQ_UI_CSS}
        componentProps={{
          connectionList: {
            cols: ['provider', 'type', 'status', 'actions'],
          },
          editOIDCConnection: { displayInfo: false },
          editSAMLConnection: { displayInfo: false },
        }}
      />
    </>
  );
};

TeamSSO.getLayout = function getLayout(page: React.ReactNode) {
  return (
    <AccountLayout>
      <TeamLayout>{page}</TeamLayout>
    </AccountLayout>
  );
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const { locale, req, res, query } = context;

  if (!env.teamFeatures.sso) {
    return {
      notFound: true,
    };
  }

  const session = await getSession(req, res);
  const teamMember = await getTeamMember(
    session?.user.id as string,
    query.slug as string
  );

  try {
    throwIfNotAllowed(teamMember, 'team_sso', 'read');

    const SPConfigURL = env.jackson.selfHosted
      ? `${env.jackson.externalUrl}/.well-known/saml-configuration`
      : '/well-known/saml-configuration';

    return {
      props: {
        ...(locale ? await serverSideTranslations(locale, ['common']) : {}),
        error: null,
        teamFeatures: env.teamFeatures,
        SPConfigURL,
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
        SPConfigURL: null,
      },
    };
  }
}

export default TeamSSO;
