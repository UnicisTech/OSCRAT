import React from 'react';
import { TeamContextProvider } from '@/context/TeamContext';
import { ProductContextProvider, useProductContext } from '@/context/ProductContext';
import { VersionContextProvider } from '@/context/VersionContext';
import { useTeamContext } from '@/context/TeamContext';
import { SidePanel } from '@/components/shared';
import { useTranslation } from 'next-i18next';

const VersionLayoutInner = ({ children }) => {
  const { t, ready } = useTranslation('common');

  if (!ready) return null;

  return (
    <div className="flex h-screen">
      <SidePanel />
      <main className="flex-1 bg-white py-10 text-black dark:bg-black dark:text-white overflow-y-auto">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">{children}</div>
      </main>
    </div>
  );
};

export default function VersionLayout({ children }) {
  return (
    <TeamContextProvider>
      <ProductContextProvider>
        <VersionContextProvider>
          <VersionLayoutInner>{children}</VersionLayoutInner>
        </VersionContextProvider>
      </ProductContextProvider>
    </TeamContextProvider>
  );
}
