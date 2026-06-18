import {
  Cog6ToothIcon,
  UserPlusIcon,
  ClipboardDocumentListIcon,
} from '@heroicons/react/24/outline';
import type { Team } from '@oscrat/model';
import classNames from 'classnames';
import Link from 'next/link';
import { TeamFeature } from 'types';
import useCanAccess from '@/hooks/useCanAccess';
interface TeamTabProps {
  activeTab: string;
  team: Team;
  heading?: string;
  teamFeatures: TeamFeature;
}

const TeamTab = ({ activeTab, team, heading, teamFeatures }: TeamTabProps) => {
  const { canAccess } = useCanAccess(team.slug);

  const teamSlug = team.slug;

  const navigations = [
    {
      name: 'Settings',
      href: `/organization/${teamSlug}/settings`,
      active: activeTab === 'settings',
      icon: Cog6ToothIcon,
    },
  ];

  if (canAccess('team_member', ['create', 'update', 'read', 'delete'])) {
    navigations.push({
      name: 'Members',
      href: `/organization/${teamSlug}/members`,
      active: activeTab === 'members',
      icon: UserPlusIcon,
    });
  }

  if (teamFeatures.auditLog && canAccess('team_audit_log', ['read'])) {
    navigations.push({
      name: 'Audit Logs',
      href: `/organization/${teamSlug}/audit-logs`,
      active: activeTab === 'audit-logs',
      icon: ClipboardDocumentListIcon,
    });
  }

  return (
    <div className="flex flex-col pb-6">
      <h2 className="mb-2 text-xl font-semibold">
        {heading ? heading : team.name}
      </h2>
      <nav className="border-line flex space-x-5 border-b" aria-label="Tabs">
        {navigations.map((menu) => {
          return (
            <Link
              href={menu.href}
              key={menu.href}
              className={classNames(
                'inline-flex items-center border-b-2 py-4 text-sm font-medium',
                menu.active
                  ? 'text-content-secondary border-content'
                  : 'text-content-muted hover:border-line hover:text-content-secondary border-transparent'
              )}
            >
              {menu.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default TeamTab;
