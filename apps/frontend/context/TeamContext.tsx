import React, {
  createContext,
  useContext,
  useMemo,
  ReactNode,
  useEffect,
} from 'react';
import { useRouter } from 'next/router';

// Custom hooks
import { useTeam } from '@/hooks/useTeam';
import useCanAccess from '@/hooks/useCanAccess';
import { Loading } from '@/components/shared';

type UseTeamContext = ReturnType<typeof useTeam>;
type UseCanAccessContext = ReturnType<typeof useCanAccess>;

interface TeamContextType {
  teamContext: UseTeamContext;
  accessContext: UseCanAccessContext;
  slug: string;
}

const TeamContext = createContext<TeamContextType | undefined>(undefined);

export const TeamContextProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const teamSlug = router.query.slug as string;

  const teamContext = useTeam(teamSlug);
  const accessContext = useCanAccess(teamSlug);
  const isLoading = teamContext.isLoading || accessContext.isLoading;

  useEffect(() => {
    if (!isLoading && (teamContext.error || !teamContext.team)) {
      router.replace('/404');
    }
  }, [isLoading, teamContext.error, teamContext.team, router]);

  const contextValue = useMemo<TeamContextType>(
    () => ({
      slug: teamSlug,
      teamContext,
      accessContext,
    }),
    [teamSlug, teamContext, accessContext]
  );

  if (isLoading) {
    return <Loading />;
  }

  if (!teamContext.team) {
    return <Loading />;
  }

  return (
    <TeamContext.Provider value={contextValue}>{children}</TeamContext.Provider>
  );
};

// Custom hook to consume the TeamContext
export const useTeamContext = () => {
  const context = useContext(TeamContext);
  if (!context) {
    throw new Error('useTeamContext must be used within a TeamContextProvider');
  }
  return context;
};
