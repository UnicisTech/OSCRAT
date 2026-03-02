import React from 'react';
import { Loading } from '@/components/shared';
import { useSession } from 'next-auth/react';
import SidePanel from '@/components/shared/SidePanel';


interface AccountLayoutProps {
  children: React.ReactNode;
  showSidePanel?: boolean;
}

export default function AccountLayout({ children, showSidePanel = true }: AccountLayoutProps) {
  const { status } = useSession({ required: true });

  if (status === 'loading') {
    return <Loading />;
  }

  if (showSidePanel) {
    return (
      <div className="flex h-screen">
        <SidePanel />
        <main className="flex-1 bg-white py-10 text-black dark:bg-black dark:text-white overflow-y-auto">
          <div className="mx-auto px-4 sm:px-6 lg:px-16">{children}</div>
        </main>
      </div>
    );
  }

  return (
    <main className="bg-white py-10 text-black dark:bg-black dark:text-white min-h-screen">
      <div className="mx-auto px-4 sm:px-6 lg:px-16">{children}</div>
    </main>
  );
}
