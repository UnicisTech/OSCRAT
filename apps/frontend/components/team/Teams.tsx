import { LetterAvatar } from '@/components/shared';
import { TeamSummary } from '@oscrat/model';
import { useTeams } from 'hooks/useTeams';
import { useTeam } from 'hooks/useTeam';
import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Button } from 'react-daisyui';
import toast from 'react-hot-toast';
import ConfirmationDialog from '../shared/ConfirmationDialog';
import { WithLoadingAndError } from '@/components/shared';
import CreateTeam from '@/components/oscrat/organization/addNewOrganization';
import { extractErrorMessage } from '@/lib/utils';
import { useRouter } from 'next/router';
import { useAcceptInvitation } from '@/lib/api/hooks/invitations';

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
          router.replace('/teams', undefined, { shallow: true });
        } catch (error: unknown) {
          console.error('Failed to accept invitation:', error);
          toast.error(extractErrorMessage(error, t('oscrat.ui.failed-to-accept-invitation')));
          
          router.replace('/teams', undefined, { shallow: true });
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

  return (
    <>
      <WithLoadingAndError isLoading={isLoading} error={isError}>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-3">
              <h2 className="text-xl font-medium leading-none tracking-tight">
                {t('all-teams')}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {hasTeams ? t('team-listed') : t('no-teams-yet')}
              </p>
            </div>
            <Button
              color="primary"
              variant="outline"
              size="md"
              onClick={() => setCreateTeamVisible(!createTeamVisible)}
            >
              {t('create-team')}
            </Button>
          </div>
          
            <table className="dark:border-base-200 table w-full border-b text-sm">
              <thead className="dark:bg-base-200 bg-gray-200 text-gray-600 dark:text-gray-400">
                <tr>
                  <th>{t('name')}</th>
                  <th>{t('members')}</th>
                  <th>{t('created-at')}</th>
                  <th>{t('actions')}</th>
                </tr>
              </thead>
              <tbody>
                {teamsResponse?.map((team) => (
                  <tr key={team.id}>
                    <td>
                      <Link href={`/teams/${team.slug}/dashboard`}>
                        <div className="flex items-center justify-start space-x-2">
                          <LetterAvatar name={team.name} />
                          <span className="underline">{team.name}</span>
                        </div>
                      </Link>
                    </td>
                    <td>{team.membersCount}</td>
                    <td>{new Date(team.createdAt).toDateString()}</td>
                    <td>
                      <Button
                        variant="outline"
                        size="xs"
                        color="error"
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
