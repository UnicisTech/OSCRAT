import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { Action, Resource, permissions } from '@/lib/permissions';
import type { NextApiRequest, NextApiResponse } from 'next';
import type { Session } from 'next-auth';
import type { Role, TeamMemberDetail, AuditInfo } from '@oscrat/model';
import * as TeamOps from '@oscrat/model/operations';
import { randomUUID } from 'crypto';
import { ApiError } from '@/lib/errors';

export interface AuthenticatedTeamContext {
  user: Session['user'];
  teamMember: TeamMemberDetail;
}

export interface AuthenticatedUserContext {
  user: Session['user'];
}

export interface AuthenticatedTeamRequest extends NextApiRequest {
  teamContext: AuthenticatedTeamContext;
  auditInfo: AuditInfo;
}

export interface AuthenticatedUserRequest extends NextApiRequest {
  userContext: AuthenticatedUserContext;
}

/** Get team member for a user and team slug */
export const getTeamMember = async (
  userId: string,
  slug: string
): Promise<TeamMemberDetail | null> => {
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

/** Unified middleware base for all API endpoints */
export function createMiddleware<T = any>(
  authFn?: (req: NextApiRequest, res: NextApiResponse) => Promise<any>,
  contextAttacher?: (req: NextApiRequest, context: any) => void,
  logPrefix: string = 'api'
) {
  return (handler: (req: any, res: NextApiResponse<T>) => Promise<void>) => {
    return async (req: NextApiRequest, res: NextApiResponse<T>) => {
      const { method, url } = req;
      const requestId = randomUUID().slice(0, 8);

      // Set security headers
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('X-Frame-Options', 'DENY');

      console.log(
        `[API] ${method} ${url} start, ${logPrefix}, id: ${requestId}`
      );

      try {
        let context;
        if (authFn) {
          context = await authFn(req, res);
          if (contextAttacher) {
            contextAttacher(req, context);
          }
        }

        await handler(req, res);

        const userLog = context?.user?.id ? `, user: ${context.user.id}` : '';
        console.log(
          `[API] ${method} ${url} success${userLog}, id: ${requestId}`
        );
      } catch (error: any) {
        const message = error.message || 'Something went wrong';
        const status =
          error.status || (error.message === 'Unauthorized' ? 401 : 500);
        const code = error instanceof ApiError ? error.code : undefined;
        const values = error instanceof ApiError ? error.values : undefined;

        const codeLog = code ? `, code: ${code}` : '';
        console.log(
          `[API Error] ${method} ${url} failed, error: ${message}${codeLog}, id: ${requestId}`
        );
        res.status(status).json({ error: { message, code, values } } as T);
      }
    };
  };
}

/** Team authentication middleware */
export function withTeamAuth<T = any>(resourceAction?: [Resource, Action]) {
  return (
    handler: (
      req: AuthenticatedTeamRequest,
      res: NextApiResponse<T>
    ) => Promise<void>
  ) => {
    const authFn = async (req: NextApiRequest, res: NextApiResponse) => {
      const teamContext = await getAuthenticatedTeamContext(req, res);

      // Check permissions if resource/action specified
      if (resourceAction) {
        const [resource, action] = resourceAction;
        throwIfNotAllowed(teamContext.teamMember, resource, action);
      }

      return teamContext;
    };

    const contextAttacher = (
      req: NextApiRequest,
      context: AuthenticatedTeamContext
    ) => {
      (req as AuthenticatedTeamRequest).teamContext = context;
      const { productId, versionId } = req.query;
      (req as AuthenticatedTeamRequest).auditInfo = {
        user: { id: context.user.id, name: context.user.name },
        team: { id: context.teamMember.teamId, name: context.teamMember.teamName },
        ...(productId && { productId: productId as string }),
        ...(versionId && { versionId: versionId as string }),
      };
    };

    return createMiddleware<T>(authFn, contextAttacher, 'team')(handler);
  };
}

/** User-only authentication middleware (no team membership required) */
export function withUserAuth<T = any>() {
  return (
    handler: (
      req: AuthenticatedUserRequest,
      res: NextApiResponse<T>
    ) => Promise<void>
  ) => {
    const authFn = async (req: NextApiRequest, res: NextApiResponse) => {
      const session = await getSession(req, res);

      if (!session) {
        throw new Error('Unauthorized');
      }

      return {
        user: session.user,
      } as AuthenticatedUserContext;
    };

    const contextAttacher = (
      req: NextApiRequest,
      context: AuthenticatedUserContext
    ) => {
      (req as AuthenticatedUserRequest).userContext = context;
    };

    return createMiddleware<T>(authFn, contextAttacher, 'user-auth')(handler);
  };
}

/** Check if role has permission for resource and action */
export const isAllowed = (
  role: Role,
  resource: Resource,
  action: Action
): boolean => {
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
