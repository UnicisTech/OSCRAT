import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { Loading, SidePanel } from '@/components/shared';
import { useSession } from 'next-auth/react';

export default function AppShell({ children }) {
  const { data, status } = useSession();
  const router = useRouter();

  const isFormRoute = router.pathname.startsWith('/form');

  useEffect(() => {
    if (status === 'authenticated' && data?.user?.email && data?.user?.name) {
      const { email, name } = data.user;
      const nameParts = name.split(' ');
      const [firstName = '', lastName = ''] = nameParts;

      if (typeof window !== 'undefined' && (window as any).mt) {
        (window as any).mt('send', 'pageview', {
          email,
          firstname: firstName,
          lastname: lastName,
          tags: 'BE',
        });
      }
    }
  }, [status, data]);

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
      <SidePanel />
      <div className="pl-64 dark:border-gray-200">
        <main className="bg-white py-10 text-black dark:bg-black dark:text-white">
          <div className="mx-auto px-4 sm:px-6 lg:px-8">{children}</div>
        </main>
      </div>
    </>
  );
}
