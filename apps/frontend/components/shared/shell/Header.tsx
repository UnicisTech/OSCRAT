import Link from 'next/link';
import React from 'react';
import { useSession } from 'next-auth/react';
import {
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import { signOut } from 'next-auth/react';
import { useTranslation } from 'next-i18next';
import Button from '@/components/button';

interface HeaderProps {
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const Header = ({ setSidebarOpen }: HeaderProps) => {
  const { status, data } = useSession();
  const { t } = useTranslation('common');

  if (status === 'loading' || !data) {
    return null;
  }

  const user = data.user;

  return (
    <div className="bg-surface sticky top-0 z-40 flex h-14 shrink-0 items-center border-b px-4 sm:gap-x-6 sm:px-6 lg:px-8">
      <Button
        type="button"
        variant="tertiary"
        className="text-content-secondary -m-2.5 lg:hidden"
        onClick={() => setSidebarOpen(true)}
        aria-label="Open sidebar"
        icon={<Bars3Icon className="h-6 w-6" aria-hidden="true" />}
      />
      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        <div className="relative flex flex-1"></div>
        <div className="flex items-center gap-x-4 lg:gap-x-6">
          <div className="dropdown dropdown-end">
            <div className="flex cursor-pointer items-center" tabIndex={0}>
              <span className="hidden lg:flex lg:items-center">
                <button
                  className="text-content ml-4 text-sm font-semibold leading-6"
                  aria-hidden="true"
                >
                  {user.name}
                </button>
                <ChevronDownIcon
                  className="text-content-placeholder ml-2 h-5 w-5"
                  aria-hidden="true"
                />
              </span>
            </div>
            <ul
              tabIndex={0}
              className="menu dropdown-content bg-surface z-[1] w-40 space-y-1 rounded border p-2 shadow"
            >
              <li
                onClick={() => {
                  if (document.activeElement) {
                    (document.activeElement as HTMLElement).blur();
                  }
                }}
              >
                <Link
                  href="/settings/account"
                  className="text-content block cursor-pointer px-2 py-1 text-sm leading-6"
                >
                  <div className="flex items-center">
                    <UserCircleIcon className="mr-1 h-5 w-5" /> {t('account')}
                  </div>
                </Link>
              </li>

              <li>
                <button
                  className="text-content block cursor-pointer px-2 py-1 text-sm leading-6"
                  type="button"
                  onClick={() => signOut()}
                >
                  <div className="flex items-center">
                    <ArrowRightOnRectangleIcon className="mr-1 h-5 w-5" />
                    {t('sign-out')}
                  </div>
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
