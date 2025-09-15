import {
  ChevronUpDownIcon,
  FolderIcon,
  FolderPlusIcon,
  RectangleStackIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import { useTeams } from 'hooks/useTeams';
import { useSession } from 'next-auth/react';
import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';
import useCanAccess from '@/hooks/useCanAccess';

const TeamDropdown = () => {
  const router = useRouter();
  const { slug } = router.query as { slug: string };
  const { teams } = useTeams();
  const { data } = useSession();
  const { t } = useTranslation('common');
  const { canAccess } = useCanAccess(slug);

  const currentTeam = (Array.isArray(teams) ? teams : []).find(
    (team) => team.slug === router.query.slug
  );

  const menus = [
    {
      id: 2,
      name: t('teams'),
      items: (Array.isArray(teams) ? teams : []).map((team) => ({
        id: team.id,
        name: team.name,
        href: `/teams/${team.slug}/dashboard`,
        icon: FolderIcon,
      })),
    },
    {
      id: 1,
      name: t('profile'),
      items: [
        {
          id: data?.user.id,
          name: data?.user?.name,
          href: '/settings/account',
          icon: UserCircleIcon,
        },
      ],
    },
    {
      id: 3,
      name: '',
      items: [
        {
          id: 'all-teams',
          name: t('all-teams'),
          href: '/teams',
          icon: RectangleStackIcon,
        },
        ...(canAccess('team', ['create'])
          ? [
              {
                id: 'new-team',
                name: t('new-team'),
                href: '/teams?newTeam=true',
                icon: FolderPlusIcon,
              },
            ]
          : []),
      ],
    },
  ];

  return (
    <div className="dropdown w-full">
      <div
        tabIndex={0}
        className="flex h-10 cursor-pointer items-center justify-between rounded border border-gray-300 px-4 text-sm text-black dark:border-gray-600"
      >
        <span className="truncate">{currentTeam?.name || data?.user?.name}</span>
        <ChevronUpDownIcon className="h-5 w-5" />
      </div>
      <ul
        tabIndex={0}
        className="dropdown-content dark:bg-base-100 w-full rounded border bg-white p-2 px-2 text-[#212121] shadow-md dark:border-gray-600"
      >
        {menus.map(({ id, name, items }) => {
          return (
            <React.Fragment key={id}>
              {name && (
                <li
                  className="px-2 py-1 text-xs text-gray-500"
                  key={`${id}-name`}
                >
                  {name}
                </li>
              )}
              {items.map((item) => (
                <li
                  key={`${id}-${item.id}`}
                  onClick={() => {
                    if (document.activeElement) {
                      (document.activeElement as HTMLElement).blur();
                    }
                  }}
                >
                  <Link href={item.href}>
                    <div className="flex items-center gap-2 rounded px-2 py-2 text-sm font-medium hover:bg-gray-100 focus:bg-gray-100 focus:outline-none hover:dark:text-black">
                      <item.icon className="h-5 w-5 shrink-0" /> 
                      <span className="truncate">{item.name}</span>
                    </div>
                  </Link>
                </li>
              ))}
              {name && <li className="divider m-0" key={`${id}-divider`} />}
            </React.Fragment>
          );
        })}
      </ul>
    </div>
  );
};

export default TeamDropdown;
