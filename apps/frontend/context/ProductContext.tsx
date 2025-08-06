import React, { createContext, useContext, useMemo, ReactNode } from 'react';
import { useRouter } from 'next/router';

// Custom hooks
import { useOscratProject } from '@/hooks/oscrat/useOscratProject';
import useCanAccess from '@/hooks/useCanAccess';
import { Loading } from '@/components/shared';

type UseOscratProjectContext = ReturnType<typeof useOscratProject>;
type UseCanAccessContext = ReturnType<typeof useCanAccess>;

interface ProductContextType {
  productContext: UseOscratProjectContext;
  accessContext: UseCanAccessContext;
  teamId: string;
  projectId: string;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductContextProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const router = useRouter();
  const teamId = router.query.slug as string;
  const projectId = router.query.projectId as string;

  const productContext = useOscratProject(teamId, projectId);
  const accessContext = useCanAccess(teamId);

  const contextValue = useMemo<ProductContextType>(
    () => ({
      teamId,
      projectId,
      productContext,
      accessContext,
    }),
    [teamId, projectId, productContext, accessContext]
  );

  if (productContext.isLoading || accessContext.isLoading) {
    return <Loading />;
  }

  return (
    <ProductContext.Provider value={contextValue}>
      {children}
    </ProductContext.Provider>
  );
};

// Custom hook to consume the ProductContext
export const useProductContext = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error(
      'useProductContext must be used within a ProductContextProvider'
    );
  }
  return context;
};
