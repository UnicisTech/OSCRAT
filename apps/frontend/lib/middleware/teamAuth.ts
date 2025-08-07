import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { Action, Resource, permissions } from '@/lib/permissions';
import type { NextApiRequest, NextApiResponse } from 'next';
import type { Session } from 'next-auth';
import type { Role, TeamMemberDetail } from '@oscrat/model';
import * as TeamOps from '@oscrat/model/operations';

export interface AuthenticatedTeamContext {
  user: Session['user'];
  teamMember: TeamMemberDetail;
}

export interface AuthenticatedRequest extends NextApiRequest {
  teamContext: AuthenticatedTeamContext;
}

/** Get team member for a user and team slug */
export const getTeamMember = async (userId: string, slug: string): Promise<TeamMemberDetail | null> => {
  return await TeamOps.getTeamMember(prisma, userId, slug);
};

/** Validate team access and return authenticated context */
export const getAuthenticatedTeamContext = async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<AuthenticatedTeamContext> => {
  const session = await getSession(req, res);

  if (!session) {
    throw new Error('Unauthorized');
  }

  const teamMember = await getTeamMember(
    session.user.id,
    req.query.slug as string
  );

  if (!teamMember) {
    throw new Error('You do not have access to this team');
  }

  return {
    user: session.user,
    teamMember,
  };
};

/** Unified authentication middleware */
export function withAuth<T = any>(
  resourceAction?: [Resource, Action]
) {
  return (handler: (req: AuthenticatedRequest, res: NextApiResponse<T>) => Promise<void>) => {
    return async (req: NextApiRequest, res: NextApiResponse<T>) => {
      try {
        const teamContext = await getAuthenticatedTeamContext(req, res);
        
        // Check permissions if resource/action specified
        if (resourceAction) {
          const [resource, action] = resourceAction;
          throwIfNotAllowed(teamContext.teamMember, resource, action);
        }
        
        // Attach team context to request
        (req as AuthenticatedRequest).teamContext = teamContext;
        
        return await handler(req as AuthenticatedRequest, res);
      } catch (error: any) {
        const message = error.message || 'Something went wrong';
        const status = error.status || (error.message === 'Unauthorized' ? 401 : 403);
        
        res.status(status).json({ error: { message } } as T);
      }
    };
  };
}

/** Higher-order function that wraps API handlers with team authentication */
export function withTeamAccess<T = any>(
  handler: (req: AuthenticatedRequest, res: NextApiResponse<T>) => Promise<void>
) {
  return withAuth<T>()(handler);
}

/** Check if role has permission for resource and action */
export const isAllowed = (role: Role, resource: Resource, action: Action): boolean => {
  const rolePermissions = permissions[role];

  if (!rolePermissions) {
    return false;
  }

  for (const permission of rolePermissions) {
    if (permission.resource === resource) {
      if (permission.actions === '*' || permission.actions.includes(action)) {
        return true;
      }
    }
  }

  return false;
};

/** Throw error if permission not allowed */
export const throwIfNotAllowed = (
  teamMember: TeamMemberDetail,
  resource: Resource,
  action: Action
) => {
  if (isAllowed(teamMember.role, resource, action)) {
    return true;
  }

  throw new Error(`You are not allowed to perform ${action} on ${resource}`);
};

