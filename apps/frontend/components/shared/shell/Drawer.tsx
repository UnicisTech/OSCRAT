import React from 'react';
import TeamDropdown from '../TeamDropdown';
import { XMarkIcon } from '@heroicons/react/24/outline';
import Brand from './Brand';
import Navigation from './Navigation';
import Button from '@/components/button';

interface DrawerProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const Drawer = ({ sidebarOpen, setSidebarOpen }: DrawerProps) => {
  return (
    <>
      {sidebarOpen && (
        <div className="relative z-50 lg:hidden">
          <div className="bg-surface fixed inset-0" />
          <div className="fixed inset-0 flex">
            <div className="relative mr-16 flex w-full max-w-xs flex-1">
              <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                <Button
                  type="button"
                  variant="tertiary"
                  className="-m-2.5"
                  onClick={() => setSidebarOpen(false)}
                  aria-label="Close sidebar"
                  icon={<XMarkIcon className="h-6 w-6" aria-hidden="true" />}
                />
              </div>
              <div className="bg-surface flex grow flex-col gap-y-5 overflow-y-auto px-6 pb-4">
                <Brand />
                <TeamDropdown />
                <Navigation />
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-surface text-content hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
        <div className="border-line-subtle flex grow flex-col gap-y-5 overflow-y-auto border-r px-6">
          <Brand />
          <TeamDropdown />
          <Navigation />
        </div>
      </div>
    </>
  );
};

export default Drawer;
