import { LetterAvatar } from '@/components/shared';
import { Team } from '@prisma/client';
import { useTeams } from 'hooks/useTeams';
import { useTeam } from 'hooks/useTeam';
import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Button } from 'react-daisyui';
import toast from 'react-hot-toast';
import { useRouter } from 'next/router';
import ConfirmationDialog from '../shared/ConfirmationDialog';
import { WithLoadingAndError } from '@/components/shared';
import CreateTeam from './CreateTeam';
import { extractErrorMessage } from '@/lib/utils';

const Teams = () => {
  const router = useRouter();
  const { t } = useTranslation('common');
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const {
    teams: teamsResponse,
    isLoading: isLoadingTeams,
    isError,
  } = useTeams();
  const teamSlug = selectedTeam?.slug || '';
  const { leaveTeam: leaveTeamAction, isLoading: isLeavingTeam } =
    useTeam(teamSlug);
  const leaveTeam = async () => {
    if (!selectedTeam?.slug) return;
    return leaveTeamAction();
  };
  const [askConfirmation, setAskConfirmation] = useState(false);
  const [createTeamVisible, setCreateTeamVisible] = useState(false);

  const { newTeam } = router.query as { newTeam: string };

  useEffect(() => {
    if (newTeam) {
      setCreateTeamVisible(true);
    }
  }, [newTeam]);

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
                {t('team-listed')}
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
          <table className="table w-full border-b text-sm dark:border-base-200">
            <thead className="bg-gray-200 text-gray-600 dark:bg-base-200 dark:text-gray-400">
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
                  <td>{team._count.members}</td>
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
