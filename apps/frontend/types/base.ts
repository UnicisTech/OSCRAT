import type { Prisma, TeamMember, User, Comment, Task } from '@oscrat/model';
import type { TaskCscProperties, TeamCscProperties } from './csc';
import type { TaskConfigurationProperties } from './configuration';

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
  incidentId: string | null;
  vulnerabilityId: string | null;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  createdByUser: {
    id: string;
    name: string;
    firstName: string;
    lastName: string;
  };
};

// Attachment with file data for downloads (only when needed)
export type AttachmentWithFile = Attachment & {
  file: {
    id: string;
    fileData: ArrayBuffer;
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

export type TaskProperties = TaskCscProperties & TaskConfigurationProperties;

export type ExtendedComment = Comment & {
  createdBy: User;
};

export type UserReturned = Pick<
  User,
  'name' | 'firstName' | 'lastName' | 'image'
>;
