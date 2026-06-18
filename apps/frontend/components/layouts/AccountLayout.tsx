import React from 'react';
import { Loading } from '@/components/shared';
import { useSession } from 'next-auth/react';
import SidePanel from '@/components/shared/SidePanel';

interface AccountLayoutProps {
  children: React.ReactNode;
  showSidePanel?: boolean;
}

export default function AccountLayout({
  children,
  showSidePanel = true,
}: AccountLayoutProps) {
  const { status } = useSession({ required: true });

  if (status === 'loading') {
    return <Loading />;
  }

  if (showSidePanel) {
    return (
      <div className="flex h-screen">
        <SidePanel />
        <main className="bg-surface-sunken flex-1 overflow-y-auto py-10 text-black">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    );
  }

  return (
    <main className="bg-surface-sunken min-h-screen py-10 text-black">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        {children}
      </div>
    </main>
  );
}
