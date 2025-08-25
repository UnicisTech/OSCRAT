import React from 'react';
import { TeamContextProvider } from '@/context/TeamContext';
import { ProductContextProvider, useProductContext } from '@/context/ProductContext';
import { VersionContextProvider } from '@/context/VersionContext';
import { useTeamContext } from '@/context/TeamContext';
import Header from '../oscrat/header';
import router from 'next/router';
import { useTranslation } from 'next-i18next';

const VersionLayoutInner = ({ children }) => {
  const { productContext } = useProductContext();
  const { slug } = useTeamContext();
  const { project } = productContext;
  const { t, ready } = useTranslation('common');

  if (!ready) return null;

  const handleClose = () => {
    router.push(`/teams/${slug}/products/${project?.id}`);
  };

  return (
    <>
      <Header 
        onClose={handleClose} 
        title={`${t('oscrat.ui.version-details')}`} 
      />
      <div className="mx-auto px-4 sm:px-6 lg:px-32">
        {children}
      </div>
    </>
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
