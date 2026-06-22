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
        href: `/organization/${team.slug}/dashboard`,
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
          href: '/organization',
          icon: RectangleStackIcon,
        },
        ...(canAccess('team', ['create'])
          ? [
              {
                id: 'new-team',
                name: t('new-team'),
                href: '/organization',
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
        className="border-line text-b2 text-content rounded-input flex h-12 cursor-pointer items-center justify-between border px-4"
      >
        <span className="truncate">{currentTeam?.name}</span>
        <ChevronUpDownIcon className="h-5 w-5" />
      </div>
      <ul
        tabIndex={0}
        className="dropdown-content bg-surface text-content shadow-4 rounded-input w-full border p-2 px-2"
      >
        {menus.map(({ id, name, items }) => {
          // Cap any single group at ~10 visible rows. Each row is roughly 36px
          // (px-2 py-2 + text-sm/leading-5), so 360px keeps the first ten in
          // view and lets the rest scroll inside the dropdown.
          const isScrollable = items.length > 10;

          const renderedItems = items.map((item) => (
            <li
              key={`${id}-${item.id}`}
              onClick={() => {
                if (document.activeElement) {
                  (document.activeElement as HTMLElement).blur();
                }
              }}
            >
              <Link href={item.href}>
                <div className="hover:bg-surface-muted focus:bg-surface-muted flex items-center gap-2 rounded px-2 py-2 text-sm font-medium focus:outline-none">
                  <item.icon className="h-5 w-5 shrink-0" />
                  <span className="truncate">{item.name}</span>
                </div>
              </Link>
            </li>
          ));

          return (
            <React.Fragment key={id}>
              {name && (
                <li
                  className="text-content-muted px-2 py-1 text-xs"
                  key={`${id}-name`}
                >
                  {name}
                </li>
              )}
              {isScrollable ? (
                <li key={`${id}-scroll`}>
                  <ul className="max-h-[360px] overflow-y-auto">
                    {renderedItems}
                  </ul>
                </li>
              ) : (
                renderedItems
              )}
              {name && <li className="divider m-0" key={`${id}-divider`} />}
            </React.Fragment>
          );
        })}
      </ul>
    </div>
  );
};

export default TeamDropdown;
