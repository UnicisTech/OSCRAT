import React from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import {
  RectangleStackIcon,
  Cog6ToothIcon,
  UserCircleIcon,
  DocumentCheckIcon,
  ChartBarIcon,
  ClipboardDocumentCheckIcon,
  DocumentTextIcon,
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
      className="border-line-subtle text-content-secondary hover:bg-surface-muted hover:text-content flex items-center gap-3 border-t px-3 py-2 pt-4 text-sm font-medium transition-colors"
    >
      <UserCircleIcon className="text-content-placeholder h-8 w-8 shrink-0" />
      <div className="flex min-w-0 flex-col">
        <span className="truncate text-sm font-medium">{data.user.name}</span>
        <span className="text-content-muted truncate text-xs">
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
  const logoHref = slug ? `/organization/${slug}/dashboard` : '/organization';

  const navItems = [
    {
      name: t('dashboard'),
      href: `/organization/${slug}/dashboard`,
      icon: ChartBarIcon,
      active: activePathname?.includes(`/organization/${slug}/dashboard`),
    },
    {
      name: t('products'),
      href: `/organization/${slug}/products`,
      icon: RectangleStackIcon,
      active: activePathname?.includes(`/organization/${slug}/products`),
    },
    {
      name: t('oscrat.ui.tasks.title'),
      href: `/organization/${slug}/tasks`,
      icon: DocumentCheckIcon,
      active: activePathname?.includes(`/organization/${slug}/tasks`),
    },
    {
      name: t('documentation'),
      href: `/organization/${slug}/documentation`,
      icon: DocumentTextIcon,
      active: activePathname?.includes(`/organization/${slug}/documentation`),
    },
    {
      name: t('settings'),
      href: `/organization/${slug}/settings`,
      icon: Cog6ToothIcon,
      active: activePathname?.includes(`/organization/${slug}/settings`),
    },
    {
      name: t('compliance'),
      href: `/organization/${slug}/compliance`,
      icon: ClipboardDocumentCheckIcon,
      className: 'stroke-blue-600',
      active: activePathname?.startsWith(`/organization/${slug}/compliance`),
    },
  ];

  const navigationItems = navItems;

  const renderNavItem = (item: any) => {
    const isActive = item.active;
    const IconComponent = item.icon;

    const content = (
      <div
        className={`text-b2 rounded-input group flex items-center gap-3 px-3 py-2 transition-colors ${
          isActive
            ? 'bg-info-subtle text-content font-bold'
            : 'text-content hover:bg-surface-muted'
        }`}
      >
        <IconComponent
          className={`h-5 w-5 shrink-0 ${
            isActive
              ? 'text-content'
              : 'text-content-placeholder group-hover:text-content-secondary'
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
    <div className="bg-surface flex h-full w-64 flex-col">
      {/* Logo */}
      <div className="mt-6 flex h-16 shrink-0 items-center justify-center px-6">
        <Link href={logoHref} className="w-full">
          <img src={app.logoUrl} alt={app.name} className="w-full" />
        </Link>
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
              <div role="list" className="space-y-3">
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
    <div className={`shadow-6 relative z-10 flex flex-col ${className}`}>
      {sidebarContent}
    </div>
  );
};

export default SidePanel;
