import type { Prisma, TeamMember, User, Comment, TeamSummary } from '@oscrat/model';
import type { TaskCscProperties, TeamCscProperties } from './csc';

export type ApiError = {
  code?: string;
  message: string;
  values: { [key: string]: string };
};

export type ApiResponse<T = unknown> =
  | {
      data: T;
      error: never;
    }
  | {
      data: never;
      error: ApiError;
    };

export type Role = 'owner' | 'member';


export type TaskExtended = Prisma.TaskGetPayload<{
  include: {
    comments: {
      include: {
        createdBy: true;
      };
    };
    attachments: {
      include: {
        createdByUser: true;
      };
    };
  };
}>;

// Unified attachment type for all entities (optimized for UI display)
export type Attachment = {
  id: string;
  name: string;
  fileSize: number;
  mimeType: string | null;
  description: string | null;
  url: string | null;
  fileId: string;
  taskId: number | null;
  versionId: string | null;
  sbomReportId: string | null;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  createdByUser: { id: string; name: string; firstName: string; lastName: string };
};

// Attachment with file data for downloads (only when needed)
export type AttachmentWithFile = Attachment & {
  file: {
    id: string;
    fileData: Buffer;
    createdAt: Date;
    updatedAt: Date;
  };
};

export type WebookFormSchema = {
  name: string;
  url: string;
  eventTypes: string[];
};

export type AppEvent =
  | 'invitation.created'
  | 'invitation.removed'
  | 'invitation.fetched'
  | 'member.created'
  | 'member.removed'
  | 'member.left'
  | 'member.fetched'
  | 'member.role.updated'
  | 'user.password.updated'
  | 'user.password.request'
  | 'user.updated'
  | 'user.signup'
  | 'user.password.reset'
  | 'team.fetched'
  | 'team.created'
  | 'team.updated'
  | 'team.removed'
  | 'apikey.created'
  | 'apikey.removed'
  | 'apikey.fetched'
  | 'apikey.removed'
  | 'webhook.created'
  | 'webhook.removed'
  | 'webhook.fetched'
  | 'webhook.updated'
  | 'task.created'
  | 'task.updated'
  | 'task.commented'
  | 'task.deleted';

export type AUTH_PROVIDER =
  | 'github'
  | 'google'
  | 'saml'
  | 'email'
  | 'credentials';

export type Permission = {
  resource: string;
  actions: string;
};

export interface TeamFeature {
  sso: boolean;
  dsync: boolean;
  auditLog: boolean;
  webhook: boolean;
  apiKey: boolean;
}

export type Option = {
  label: string;
  value: number;
};

export type Diff = {
  field: string;
  prevValue: string | string[] | undefined;
  nextValue: string | string[];
} | null;

export type TeamMemberWithUser = TeamMember & { user: User };

export type TeamProperties = TeamCscProperties;

export type TaskProperties = TaskCscProperties;

export type ExtendedComment = Comment & {
  createdBy: User;
};

export type UserReturned = Pick<User, 'name' | 'firstName' | 'lastName'>;
