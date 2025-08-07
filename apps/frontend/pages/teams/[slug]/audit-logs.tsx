import { Card } from '@/components/shared';
import { Error } from '@/components/shared';
import { TeamTab } from '@/components/team';
import env from '@/lib/env';
import { inferSSRProps } from '@/lib/inferSSRProps';
import { getViewerToken } from '@/lib/retraced';
import { getSession } from '@/lib/session';
import useCanAccess from 'hooks/useCanAccess';
import { useTeamContext } from '@/context/TeamContext';
import { getTeamMember } from '@/lib/middleware/teamAuth';
import { isAllowed } from '@/lib/middleware';
import { GetServerSidePropsContext } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import type { NextPageWithLayout } from 'types';
import TeamLayout from '@/components/layouts/TeamLayout';
import AccountLayout from '@/components/layouts/AccountLayout';
import React from 'react';

interface RetracedEventsBrowserProps {
  host: string;
  auditLogToken: string;
  header: string;
}

const RetracedEventsBrowser = dynamic<RetracedEventsBrowserProps>(
  () => import('@retracedhq/logs-viewer'),
  {
    ssr: false,
  }
);

const Events: NextPageWithLayout<inferSSRProps<typeof getServerSideProps>> = ({
  auditLogToken,
  retracedHost,
  error,
  teamFeatures,
}) => {
  const { t } = useTranslation('common');
  const router = useRouter();
  const { slug } = router.query;
  const { teamContext } = useTeamContext();
  const team = teamContext.team!;
  const { canAccess } = useCanAccess(slug as string);

  if (error) {
    return <Error message={error.message} />;
  }

  return (
    <>
      <TeamTab activeTab="audit-logs" team={team} teamFeatures={teamFeatures} />
      <Card>
        <Card.Body>
          {canAccess('team_audit_log', ['read']) && auditLogToken && (
            <RetracedEventsBrowser
              host={`${retracedHost}/viewer/v1`}
              auditLogToken={auditLogToken}
              header={t('audit-logs')}
            />
          )}
        </Card.Body>
      </Card>
    </>
  );
};

Events.getLayout = function getLayout(page: React.ReactNode) {
  return (
    <AccountLayout>
      <TeamLayout>{page}</TeamLayout>
    </AccountLayout>
  );
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  if (!env.teamFeatures.auditLog) {
    return {
      notFound: true,
    };
  }

  const { locale, req, res, query } = context;

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
    if (!isAllowed(teamMember.role, 'team_audit_log', 'read')) {
      return { notFound: true };
    }

    const auditLogToken = await getViewerToken(
      teamMember.team.id,
      session?.user.id as string
    );

    return {
      props: {
        ...(locale ? await serverSideTranslations(locale, ['common']) : {}),
        error: null,
        auditLogToken: auditLogToken ?? '',
        retracedHost: env.retraced.url ?? '',
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
        auditLogToken: null,
        retracedHost: null,
        teamFeatures: env.teamFeatures,
      },
    };
  }
}

export default Events;
