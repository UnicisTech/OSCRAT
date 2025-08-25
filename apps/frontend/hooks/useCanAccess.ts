import type { Resource, Action } from '@/lib/permissions';
import { usePermissions } from './usePermissions';

const useCanAccess = (teamSlug: string) => {
  const { permissions, error: isError, isLoading } = usePermissions(teamSlug);

  const canAccess = (resource: Resource, actions: Action[]) => {

    if (!permissions) return false;

    const permission = permissions.find((p) => p.resource === resource);

    if (!permission) return false;

    if (permission.actions === '*') return true;

    return actions.every((action) => permission.actions.includes(action));
  };

  return {
    isLoading,
    isError,
    canAccess,
  };
};

export default useCanAccess;
