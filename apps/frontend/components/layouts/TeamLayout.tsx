import React from 'react';
import { TeamContextProvider } from '@/context/TeamContext';
import { SidePanel } from '@/components/shared';

interface TeamLayoutProps {
  children: React.ReactNode;
}

export default function TeamLayout({ children }: TeamLayoutProps) {
  return (
    <TeamContextProvider>
      <div className="flex h-screen">
        <SidePanel />
        <main className="flex-1 bg-white py-10 text-black dark:bg-black dark:text-white overflow-y-auto">
          <div className="mx-auto px-4 sm:px-6 lg:px-8">{children}</div>
        </main>
      </div>
    </TeamContextProvider>
  );
}
