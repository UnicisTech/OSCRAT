import { Card, Error, LetterAvatar, Loading } from '@/components/shared';
import { Team, TeamMember } from '@oscrat/model';
import useCanAccess from '@/hooks/useCanAccess';
import { useTeamMembers } from 'hooks/useTeamMembers';
import { useSession } from 'next-auth/react';
import { useTranslation } from 'next-i18next';
import toast from 'react-hot-toast';
import Button from '@/components/button';
import { InviteMember } from '@/components/invitation';
import UpdateMemberRole from './UpdateMemberRole';
import ConfirmationDialog from '../shared/ConfirmationDialog';
import { useState } from 'react';
import { extractErrorMessage } from '@/lib/utils';

const Members = ({ team }: { team: Team }) => {
  const { data: session } = useSession();
  const { t } = useTranslation('common');
  const { canAccess } = useCanAccess(team.slug);
  const [visible, setVisible] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [confirmationDialogVisible, setConfirmationDialogVisible] =
    useState(false);

  const { members, isLoading, isError, error, deleteMember } = useTeamMembers(
    team.slug
  );

  if (isLoading) {
    return <Loading />;
  }

  if (isError) {
    return <Error message={error?.message} />;
  }

  if (!members) {
    return null;
  }

  const removeTeamMember = async (member: TeamMember | null) => {
    if (!member) return;

    try {
      await deleteMember(member.userId);
      toast.success(t('member-deleted'));
    } catch (error: unknown) {
      toast.error(extractErrorMessage(error, t('error-deleting-member')));
    } finally {
      setConfirmationDialogVisible(false);
      setSelectedMember(null);
    }
  };

  const canUpdateRole = (member: TeamMember) => {
    return (
      session?.user.id != member.userId && canAccess('team_member', ['update'])
    );
  };

  const canRemoveMember = (member: TeamMember) => {
    return (
      session?.user.id != member.userId && canAccess('team_member', ['delete'])
    );
  };

  return (
    <Card>
      <Card.Body>
        <div className="flex items-center justify-between">
          <Card.Header>
            <Card.Title>Members</Card.Title>
            <Card.Description>
              Organization members and their roles.
            </Card.Description>
          </Card.Header>
          {canAccess('team_invitation', ['create']) && (
            <Button variant="primary" onClick={() => setVisible(!visible)}>
              {t('add-member')}
            </Button>
          )}
        </div>
        <table className="table w-full border-b text-sm">
          <thead className="bg-surface-muted text-content border-line-header border-b">
            <tr>
              <th className="text-b2 p-4 font-medium">{t('name')}</th>
              <th className="text-b2 p-4 font-medium">{t('email')}</th>
              <th className="text-b2 p-4 font-medium">{t('role')}</th>
              {canAccess('team_member', ['delete']) && (
                <th className="text-b2 p-4 font-medium">{t('action')}</th>
              )}
            </tr>
          </thead>
          <tbody>
            {members.map((member) => {
              return (
                <tr key={member.id}>
                  <td>
                    <div className="flex items-center justify-start space-x-2">
                      <LetterAvatar name={member.user.name} />
                      <span>{member.user.name}</span>
                    </div>
                  </td>
                  <td>{member.user.email}</td>
                  <td>
                    {canUpdateRole(member) ? (
                      <UpdateMemberRole team={team} member={member} />
                    ) : (
                      <span>{member.role}</span>
                    )}
                  </td>
                  <td>
                    {canRemoveMember(member) ? (
                      <Button
                        size="m"
                        tone="danger"
                        variant="secondary"
                        onClick={() => {
                          setSelectedMember(member);
                          setConfirmationDialogVisible(true);
                        }}
                      >
                        {t('remove')}
                      </Button>
                    ) : (
                      <span>-</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <ConfirmationDialog
          visible={confirmationDialogVisible}
          onCancel={() => {
            setConfirmationDialogVisible(false);
            setSelectedMember(null);
          }}
          onConfirm={() => removeTeamMember(selectedMember)}
          title={t('confirm-delete-member')}
        >
          {t('delete-member-warning')}
        </ConfirmationDialog>
        <InviteMember visible={visible} setVisible={setVisible} team={team} />
      </Card.Body>
    </Card>
  );
};

export default Members;
