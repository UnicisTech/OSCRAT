import { LetterAvatar } from '@/components/shared';
import { TeamSummary } from '@oscrat/model';
import { useTeams } from 'hooks/useTeams';
import { useTeam } from 'hooks/useTeam';
import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import { useState, useEffect, useMemo } from 'react';
import Button from '@/components/button';
import toast from 'react-hot-toast';
import ConfirmationDialog from '../shared/ConfirmationDialog';
import { WithLoadingAndError } from '@/components/shared';
import CreateTeam from '@/components/oscrat/organization/addNewOrganization';
import { extractErrorMessage } from '@/lib/utils';
import { useRouter } from 'next/router';
import { useAcceptInvitation } from '@/lib/api/hooks/invitations';
import usePagination from '@/hooks/usePagination';
import PaginationControls from '@/components/shared/PaginationControls';
import { formatDateShort } from '@/utils/dateFormat';

const TEAMS_PER_PAGE = 10;

const Teams = () => {
  const { t } = useTranslation('common');
  const router = useRouter();
  const [selectedTeam, setSelectedTeam] = useState<TeamSummary | null>(null);
  const {
    teams: teamsResponse,
    isLoading: isLoadingTeams,
    isError,
  } = useTeams();
  const teamSlug = selectedTeam?.slug || '';
  const { leaveTeam: leaveTeamAction, isLoading: isLeavingTeam } =
    useTeam(teamSlug);
  const { mutateAsync: acceptInvitationMutation } = useAcceptInvitation();
  const leaveTeam = async () => {
    if (!selectedTeam?.slug) return;
    return leaveTeamAction();
  };
  const [askConfirmation, setAskConfirmation] = useState(false);
  const [createTeamVisible, setCreateTeamVisible] = useState(false);

  // Handle invitation acceptance from query param
  useEffect(() => {
    const handleInvitationAcceptance = async () => {
      const inviteToken = router.query.token as string;

      if (inviteToken) {
        try {
          await acceptInvitationMutation({ token: inviteToken });
          toast.success(t('oscrat.ui.invitation-accepted'));
          router.replace('/organization', undefined, { shallow: true });
        } catch (error: unknown) {
          console.error('Failed to accept invitation:', error);
          toast.error(
            extractErrorMessage(
              error,
              t('oscrat.ui.failed-to-accept-invitation')
            )
          );

          router.replace('/organization', undefined, { shallow: true });
        }
      }
    };

    handleInvitationAcceptance();
  }, [router.query.token, acceptInvitationMutation, router, t]);

  const handleLeaveTeam = async () => {
    try {
      await leaveTeam();
      toast.success(t('leave-team-success'));
      setAskConfirmation(false);
      setSelectedTeam(null);
    } catch (error: unknown) {
      toast.error(extractErrorMessage(error, t('error-generic')));
    }
  };

  const isLoading = isLoadingTeams || isLeavingTeam;

  const hasTeams = teamsResponse && teamsResponse.length > 0;

  const teamsList = useMemo(() => teamsResponse ?? [], [teamsResponse]);

  const {
    currentPage,
    totalPages,
    pageData: paginatedTeams,
    goToPreviousPage,
    goToNextPage,
    prevButtonDisabled,
    nextButtonDisabled,
  } = usePagination(teamsList, TEAMS_PER_PAGE);

  return (
    <>
      <WithLoadingAndError isLoading={isLoading} error={isError}>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-3">
              <h2 className="text-xl font-medium leading-none tracking-tight">
                {t('all-teams')}
              </h2>
              <p className="text-content-muted text-sm">
                {hasTeams ? t('team-listed') : t('no-teams-yet')}
              </p>
            </div>
            <Button
              variant="primary"
              onClick={() => setCreateTeamVisible(!createTeamVisible)}
            >
              {t('create-team')}
            </Button>
          </div>

          <table className="table w-full border-b text-sm">
            <thead className="bg-surface-muted text-content border-line-header border-b">
              <tr>
                <th className="text-b2 p-4 font-medium">{t('name')}</th>
                <th className="text-b2 p-4 font-medium">{t('members')}</th>
                <th className="text-b2 p-4 font-medium">{t('created-at')}</th>
                <th className="text-b2 p-4 font-medium">{t('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {paginatedTeams.map((team) => (
                <tr key={team.id}>
                  <td>
                    <Link href={`/organization/${team.slug}/dashboard`}>
                      <div className="flex items-center justify-start space-x-2">
                        <LetterAvatar name={team.name} />
                        <span className="underline">{team.name}</span>
                      </div>
                    </Link>
                  </td>
                  <td>{team.membersCount}</td>
                  <td>{formatDateShort(team.createdAt)}</td>
                  <td>
                    <Button
                      variant="secondary"
                      tone="danger"
                      size="s"
                      onClick={() => {
                        setSelectedTeam(team);
                        setAskConfirmation(true);
                      }}
                    >
                      {t('leave-team')}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {totalPages > 1 && (
            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              prevButtonDisabled={prevButtonDisabled}
              nextButtonDisabled={nextButtonDisabled}
              goToPreviousPage={goToPreviousPage}
              goToNextPage={goToNextPage}
              showItemCount
              totalItems={teamsList.length}
              itemsPerPage={TEAMS_PER_PAGE}
            />
          )}

          <ConfirmationDialog
            visible={askConfirmation}
            title={`${t('leave-team')} ${selectedTeam?.name}`}
            onCancel={() => {
              setAskConfirmation(false);
              setSelectedTeam(null);
            }}
            onConfirm={() => {
              if (selectedTeam) {
                handleLeaveTeam();
              }
            }}
            confirmText={t('leave-team')}
          >
            {t('leave-team-confirmation')}
          </ConfirmationDialog>
          <CreateTeam
            visible={createTeamVisible}
            setVisible={setCreateTeamVisible}
          />
        </div>
      </WithLoadingAndError>
    </>
  );
};

export default Teams;
