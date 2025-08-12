import React, { createContext, useContext, useMemo, ReactNode } from 'react';
import { useRouter } from 'next/router';

// Custom hooks
import { useOscratVersion } from '@/hooks/oscrat/useOscratVersion';
import useCanAccess from '@/hooks/useCanAccess';
import { Loading } from '@/components/shared';
import { useProductContext } from '@/context/ProductContext';
import { useTeamContext } from '@/context/TeamContext';

type UseOscratVersionContext = ReturnType<typeof useOscratVersion>;
type UseCanAccessContext = ReturnType<typeof useCanAccess>;

interface VersionContextType {
  versionContext: UseOscratVersionContext;
  accessContext: UseCanAccessContext;
  teamId: string;
  productId: string;
  versionId: string;
}

const VersionContext = createContext<VersionContextType | undefined>(undefined);

export const VersionContextProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const router = useRouter();
  const teamId = router.query.slug as string;
  const { slug } = useTeamContext();
  const { productId } = useProductContext();
  const versionId = router.query.versionId as string;

  const versionContext = useOscratVersion(teamId, productId, versionId);
  const accessContext = useCanAccess(slug);

  const contextValue = useMemo<VersionContextType>(
    () => ({
      teamId,
      productId,
      versionId,
      versionContext,
      accessContext,
    }),
    [teamId, productId, versionId, versionContext, accessContext]
  );

  if (versionContext.isLoading || accessContext.isLoading) {
    return <Loading />;
  }

  return (
    <VersionContext.Provider value={contextValue}>
      {children}
    </VersionContext.Provider>
  );
};

// Custom hook to consume the VersionContext
export const useVersionContext = () => {
  const context = useContext(VersionContext);
  if (!context) {
    throw new Error(
      'useVersionContext must be used within a VersionsContextProvider'
    );
  }
  return context;
};
