import React from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import Header from '@/components/oscrat/header';

interface CraLayoutProps {
  children: React.ReactNode;
}

export default function CraLayout({ children }: CraLayoutProps) {
  const { status } = useSession();
  const router = useRouter();
  const { t, ready } = useTranslation('common');

  if (!ready) return null;

  const handleClose = () => {
    if (status === 'authenticated') {
      router.back();
    } else {
      router.push('/auth/login');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title={t('oscrat.ui.cra-app-check')} onClose={handleClose} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}