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
        <main className="bg-surface-sunken flex-1 overflow-y-auto py-10 text-black">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </TeamContextProvider>
  );
}
