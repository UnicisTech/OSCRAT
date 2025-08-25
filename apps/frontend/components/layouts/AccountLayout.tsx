import React from 'react';
import { Loading } from '@/components/shared';
import { useSession } from 'next-auth/react';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import SidePanel from '@/components/shared/SidePanel';


interface AccountLayoutProps {
  children: React.ReactNode;
}

export default function AccountLayout({ children }: AccountLayoutProps) {
  const { status } = useSession();
  const { t, ready } = useTranslation('common');
  const router = useRouter();

  // Check if current route should show SidePanel
  const shouldShowSidePanel = router.pathname === '/teams';
  
  if (!ready) return null;

  if (status === 'loading') {
    return <Loading />;
  }

  if (status === 'unauthenticated') {
    return <p>Access Denied</p>;
  }

  // Layout with SidePanel for /teams routes
  if (shouldShowSidePanel) {
    return (
      <div className="flex h-screen">
        <SidePanel />
        <main className="flex-1 bg-white py-10 text-black dark:bg-black dark:text-white overflow-y-auto">
          <div className="mx-auto px-4 sm:px-6 lg:px-16">{children}</div>
        </main>
      </div>
    );
  }

  // Layout without SidePanel for other routes
  return (
    <main className="bg-white py-10 text-black dark:bg-black dark:text-white min-h-screen">
      <div className="mx-auto px-4 sm:px-6 lg:px-16">{children}</div>
    </main>
  );
}
