import Link from 'next/link';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useTranslation } from 'next-i18next';
import { Card, Error, LetterAvatar, Loading } from '@/components/shared';
import Button from '@/components/button';
import { useTeams } from 'hooks/useTeams';
import { TeamSummary } from '@oscrat/model';
import { ApiResponse } from 'types';
import { formatDateShort } from '@/utils/dateFormat';

const Teams = () => {
  const { isLoading, isError, teams } = useTeams();
  const { t } = useTranslation('common');
  if (isLoading) {
    return <Loading />;
  }

  if (isError) {
    return <Error />;
  }

  const leaveTeam = async (team: TeamSummary) => {
    const response = await axios.put<ApiResponse>(
      `/api/teams/${team.slug}/members`
    );

    const { error } = response.data;

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success(t('leave-team-success'));

    // mutateTeams();
  };

  return (
    <Card heading="Your Organizations">
      <Card.Body>
        <table className="text-content-muted w-full table-fixed text-left text-sm">
          <thead className="bg-surface-muted text-content border-line-header border-b">
            <tr>
              <th scope="col" className="text-b2 p-4 font-medium">
                {t('name')}
              </th>
              <th scope="col" className="text-b2 p-4 font-medium">
                {t('members')}
              </th>
              <th scope="col" className="text-b2 p-4 font-medium">
                {t('created-at')}
              </th>
              <th scope="col" className="text-b2 p-4 font-medium">
                {t('actions')}
              </th>
            </tr>
          </thead>
          <tbody>
            {teams &&
              teams.map((team) => {
                return (
                  <tr
                    key={team.id}
                    className="bg-surface hover:bg-surface-muted border-b"
                  >
                    <td className="px-4 py-3">
                      <Link href={`/organization/${team.slug}/tasks`}>
                        <div className="flex items-center justify-start space-x-2">
                          <LetterAvatar name={team.name} />
                          <span className="underline">{team.name}</span>
                        </div>
                      </Link>
                    </td>
                    <td className="px-4 py-3">{team.membersCount}</td>
                    <td className="px-4 py-3">
                      {formatDateShort(team.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <Button
                        size="m"
                        variant="secondary"
                        onClick={() => {
                          leaveTeam(team);
                        }}
                      >
                        {t('leave-team')}
                      </Button>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </Card.Body>
    </Card>
  );
};

export default Teams;
