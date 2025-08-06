import type { Action, Resource } from '@/lib/permissions';
import { useTeamContext } from '@/context/TeamContext';

interface AccessControlProps {
  children: React.ReactNode;
  resource: Resource;
  actions: Action[];
}

export const AccessControl = ({
  children,
  resource,
  actions,
}: AccessControlProps) => {
  const { accessContext } = useTeamContext();
  const { canAccess } = accessContext;

  if (!canAccess(resource, actions)) {
    return null;
  }

  return <>{children}</>;
};
