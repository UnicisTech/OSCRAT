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
    <div className="sticky top-0 z-40 flex h-14 shrink-0 items-center border-b bg-white px-4 sm:gap-x-6 sm:px-6 lg:px-8 dark:border-gray-600 dark:bg-[color:hsla(var(--b1))]">
      <button
        type="button"
        className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
        onClick={() => setSidebarOpen(true)}
      >
        <span className="sr-only">Open sidebar</span>
        <Bars3Icon className="h-6 w-6" aria-hidden="true" />
      </button>
      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        <div className="relative flex flex-1"></div>
        <div className="flex items-center gap-x-4 lg:gap-x-6">
          <div className="dropdown dropdown-end">
            <div className="flex cursor-pointer items-center" tabIndex={0}>
              <span className="hidden lg:flex lg:items-center">
                <button
                  className="ml-4 text-sm font-semibold leading-6 text-gray-900 dark:text-gray-400"
                  aria-hidden="true"
                >
                  {user.name}
                </button>
                <ChevronDownIcon
                  className="ml-2 h-5 w-5 text-gray-400"
                  aria-hidden="true"
                />
              </span>
            </div>
            <ul
              tabIndex={0}
              className="menu dropdown-content dark:bg-base-100 z-[1] w-40 space-y-1 rounded border bg-white p-2 shadow"
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
                  className="block cursor-pointer px-2 py-1 text-sm leading-6 text-gray-900 dark:text-gray-400"
                >
                  <div className="flex items-center">
                    <UserCircleIcon className="mr-1 h-5 w-5" /> {t('account')}
                  </div>
                </Link>
              </li>

              <li>
                <button
                  className="block cursor-pointer px-2 py-1 text-sm leading-6 text-gray-900 dark:text-gray-400"
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
