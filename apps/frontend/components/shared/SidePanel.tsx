import React from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import {
  RectangleStackIcon,
  Cog6ToothIcon,
  ExclamationCircleIcon,
  UserCircleIcon,
  DocumentCheckIcon,
  ChartBarIcon,
  ClipboardDocumentCheckIcon
} from '@heroicons/react/24/outline';
import app from '@/lib/app';
import TeamDropdown from './TeamDropdown';
import { useSession } from 'next-auth/react';

interface SidePanelProps {
  className?: string;
}

const AccountSettings = () => {
  const { status, data } = useSession();
  if (status === 'loading' || !data) {
    return null;
  }

  return (
    <Link
      href="/settings/account"
      className="flex items-center gap-3 border-t border-gray-200 px-3 py-2 pt-4 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
    >
      <UserCircleIcon className="h-8 w-8 shrink-0 text-gray-400" />
      <div className="flex min-w-0 flex-col">
        <span className="truncate text-sm font-medium">{data.user.name}</span>
        <span className="truncate text-xs text-gray-500 dark:text-gray-400">
          {data.user.email}
        </span>
      </div>
    </Link>
  );
};

const SidePanel: React.FC<SidePanelProps> = ({ className = '' }) => {
  const router = useRouter();
  const { t } = useTranslation('common');
  const { slug } = router.query as { slug: string };
  const activePathname = router.asPath;

  const navItems = [
    {
      name: t('dashboard'),
      href: `/teams/${slug}/dashboard`,
      icon: ChartBarIcon,
      active: activePathname?.includes(`/teams/${slug}/dashboard`),
    },
    {
      name: t('products'),
      href: `/teams/${slug}/products`,
      icon: RectangleStackIcon,
      active: activePathname?.includes(`/teams/${slug}/products`),
    },
    {
      name: t('oscrat.ui.tasks'),
      href: `/teams/${slug}/tasks`,
      icon: DocumentCheckIcon,
      active: activePathname?.includes(`/teams/${slug}/tasks`),
    },
    {
      name: t('settings'),
      href: `/teams/${slug}/settings`,
      icon: Cog6ToothIcon,
      active: activePathname?.includes(`/teams/${slug}/settings`),
    },
    {
      name: t('reports'),
      href: '#',
      icon: ExclamationCircleIcon,
    },
    {
      name: t('compliance'),
      href: `/teams/${slug}/compliance`,
      icon: ClipboardDocumentCheckIcon,
      className: 'stroke-blue-600',
      active:
        activePathname?.startsWith(`/teams/${slug}/compliance`)
    },
  ];

  const navigationItems = navItems;

  const renderNavItem = (item: any) => {
    const isActive = item.active;
    const IconComponent = item.icon;

    const content = (
      <div
        className={`group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
          isActive
            ? 'bg-gray-100 font-medium text-gray-900 dark:bg-gray-800 dark:text-white'
            : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white'
        }`}
      >
        <IconComponent
          className={`h-5 w-5 shrink-0 ${
            isActive
              ? 'text-gray-900 dark:text-white'
              : 'text-gray-400 group-hover:text-gray-600 dark:text-gray-400 dark:group-hover:text-gray-300'
          }`}
        />
        <span className="truncate">{item.name}</span>
      </div>
    );

    if (item.external) {
      return (
        <a
          key={item.name}
          href={item.href}
          target="_blank"
          rel="noopener noreferrer"
          className="block"
        >
          {content}
        </a>
      );
    }

    return (
      <Link key={item.name} href={item.href} className="block">
        {content}
      </Link>
    );
  };

  const sidebarContent = (
    <div className="flex h-full w-64 flex-col bg-white dark:bg-gray-900">
      {/* Logo */}
      <div className="mt-6 flex h-16 shrink-0 items-center justify-center px-6 dark:border-gray-800">
        <img src={app.logoUrl} alt={app.name} className="w-full" />
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col overflow-y-auto px-6 py-6">
        {/* Team Content - Only show if user has a team (slug exists) */}
        {slug && (
          <div className="flex flex-1 flex-col gap-y-6">
            {/* Team Dropdown */}
            <TeamDropdown />

            {/* Primary Navigation */}
            <nav className="flex flex-1 flex-col">
              <div role="list" className="space-y-1">
                {navigationItems.map((item) => renderNavItem(item))}
              </div>
            </nav>
          </div>
        )}

        {/* Spacer to push Account Settings to bottom when no team content */}
        {!slug && <div className="flex-1"></div>}

        {/* Account - Always show at bottom */}
        <AccountSettings />
      </div>
    </div>
  );

  return (
    <div
      className={`relative z-10 flex flex-col shadow-lg shadow-gray-400/50 ${className}`}
    >
      {sidebarContent}
    </div>
  );
};

export default SidePanel;
