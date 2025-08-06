import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Loading } from '@/components/shared';
import { useSession } from 'next-auth/react';
import Header from './Header';
import Drawer from './Drawer';

export default function AppShell({ children }) {
  const { data, status } = useSession();
  const router = useRouter();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isFormRoute = router.pathname.startsWith('/form');

  useEffect(() => {
    if (status === 'authenticated') {
      const { email, name } = data.user;
      if (email && name) {
        const [firstName, lastName] = name.split(' ') as string[];
        if ((window as any).mt) {
          (window as any).mt('send', 'pageview', {
            email: email,
            firstname: firstName,
            lastname: lastName,
            tags: 'BE',
          });
        }
      }
    }
  }, [status]);

  if (status === 'loading') {
    return <Loading />;
  }

  if (isFormRoute) {
    return <div className="p-10">{children}</div>;
  }

  if (status === 'unauthenticated') {
    return <p>Access Denied</p>;
  }

  return (
    <>
      <Drawer sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="lg:pl-64 dark:border-gray-200">
        <Header setSidebarOpen={setSidebarOpen} />
        <main className="bg-white py-10 text-black dark:bg-black dark:text-white">
          <div className="mx-auto px-4 sm:px-6 lg:px-8">{children}</div>
        </main>
      </div>
    </>
  );
}
