import { availableRoles } from '@/lib/permissions';
import { Team, TeamMember } from '@oscrat/model';
import { useTranslation } from 'next-i18next';
import toast from 'react-hot-toast';
import { useTeamMembers } from '@/hooks/useTeamMembers';
import { extractErrorMessage } from '@/lib/utils';

interface UpdateMemberRoleProps {
  team: Team;
  member: TeamMember;
}

const UpdateMemberRole = ({ team, member }: UpdateMemberRoleProps) => {
  const { t } = useTranslation('common');
  const { updateMember, isLoading } = useTeamMembers(team.slug);

  const handleRoleUpdate = async (role: string) => {
    try {
      await updateMember(member.userId, role);
      toast.success(t('member-role-updated'));
    } catch (error: unknown) {
      toast.error(extractErrorMessage(error, t('an-error-occurred')));
    }
  };

  return (
    <select
      className="select select-bordered select-sm bg-surface border-line rounded text-black"
      onChange={(e) => handleRoleUpdate(e.target.value)}
      value={member.role}
      disabled={isLoading}
    >
      {availableRoles.map((role) => (
        <option value={role.id} key={role.id} className="bg-surface text-black">
          {role.id}
        </option>
      ))}
    </select>
  );
};

export default UpdateMemberRole;
