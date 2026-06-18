import React from 'react';
import { withTeamLayout } from '@/lib/layout-helpers';
import { Card } from '@/components/shared';
import { Error } from '@/components/shared';
import { TeamTab } from '@/components/team';
import env from '@/lib/env';
import { getSession } from '@/lib/session';
import useCanAccess from 'hooks/useCanAccess';
import { useTeamContext } from '@/context/TeamContext';
import { getTeamMember, isAllowed } from '@/lib/middleware/auth';
import { GetServerSidePropsContext } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';
import type { NextPageWithLayout } from 'types';
import { useAuditLogs } from '@/hooks/useAuditLogs';
import { useAuditLogFilterOptions } from '@/lib/api/hooks/auditLogs';
import AuditLogsTable from '@/components/team/AuditLogsTable';
import AuditLogsFilters from '@/components/team/AuditLogsFilters';
import PaginationControls from '@/components/shared/PaginationControls';

interface AuditLogsPageProps {
  teamFeatures: typeof env.teamFeatures;
}

const AuditLogsPage: NextPageWithLayout<AuditLogsPageProps> = ({
  teamFeatures,
}) => {
  const { t } = useTranslation('common');
  const router = useRouter();
  const { slug } = router.query;
  const { teamContext } = useTeamContext();
  const team = teamContext.team!;
  const { canAccess } = useCanAccess(slug as string);

  const {
    auditLogs,
    total,
    currentPage,
    totalPages,
    pageSize,
    goToNextPage,
    goToPreviousPage,
    prevButtonDisabled,
    nextButtonDisabled,
    filters,
    updateFilters,
    isLoading,
    isError,
    error,
  } = useAuditLogs(slug as string);

  const { data: filterOptions, isLoading: isLoadingOptions } =
    useAuditLogFilterOptions(slug as string);

  if (!canAccess('team_audit_log', ['read'])) {
    return <Error message={t('unauthorized')} />;
  }

  if (isError) {
    return <Error message={error?.message || t('error-loading-audit-logs')} />;
  }

  return (
    <>
      <TeamTab activeTab="audit-logs" team={team} teamFeatures={teamFeatures} />
      <Card>
        <Card.Body>
          <div className="flex items-center justify-between">
            <Card.Header>
              <Card.Title>{t('audit-logs')}</Card.Title>
            </Card.Header>
            <AuditLogsFilters
              filters={filters}
              onFilterChange={updateFilters}
              filterOptions={filterOptions}
              isLoadingOptions={isLoadingOptions}
            />
          </div>
          <AuditLogsTable logs={auditLogs} isLoading={isLoading} />
          {total > pageSize && (
            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              prevButtonDisabled={prevButtonDisabled}
              nextButtonDisabled={nextButtonDisabled}
              goToPreviousPage={goToPreviousPage}
              goToNextPage={goToNextPage}
              showItemCount={true}
              totalItems={total}
              itemsPerPage={pageSize}
            />
          )}
        </Card.Body>
      </Card>
    </>
  );
};

AuditLogsPage.getLayout = withTeamLayout;

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

  if (!isAllowed(teamMember.role, 'team_audit_log', 'read')) {
    return { notFound: true };
  }

  return {
    props: {
      ...(locale ? await serverSideTranslations(locale, ['common']) : {}),
      teamFeatures: env.teamFeatures,
    },
  };
}

export default AuditLogsPage;
