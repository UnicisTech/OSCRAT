import {
  ExtendedComment,
  Attachment,
} from '@/types';
import { api } from '@/lib/api/client';
import {
  Task,
  TaskStatus,
  TaskOriginType,
  DocumentationStatus,
  type TaskProperties,
} from '@oscrat/model';

export interface TaskLinkedDocumentation {
  id: string;
  slug: string;
  title: string;
  status: DocumentationStatus;
  visibility: 'PUBLIC' | 'PRIVATE';
  productName?: string;
  versionName?: string;
  updatedAt: string;
}

export type CreateTaskData = {
  title: string;
  description?: string;
  assigneeId?: string | null;
  duedate?: Date;
  priority?: string;
  status?: TaskStatus;
  productId?: string;
  versionId?: string;
  originType?: TaskOriginType;
  properties?: TaskProperties;
};

export type UpdateTaskData = Partial<CreateTaskData>;

export type CreateCommentData = {
  text: string;
};

export type UpdateCommentData = {
  text: string;
  id: string;
};

// Attachment types
export interface AttachmentUploadParams {
  file: File;
  taskId: number;
  description?: string;
  slug: string;
  versionId?: string;
}

export const tasksEndpoints = {
  // Team tasks
  getTeamTasks: (slug: string) => api.get<Task[]>(`/teams/${slug}/tasks`),

  createTeamTask: (slug: string, data: CreateTaskData) =>
    api.post<Task>(`/teams/${slug}/tasks`, data),

  // Single task
  getTask: (slug: string, taskNumber: string) =>
    api.get<Task>(`/teams/${slug}/tasks/${taskNumber}`),

  updateTask: (slug: string, taskNumber: string, data: UpdateTaskData) =>
    api.put<Task>(`/teams/${slug}/tasks/${taskNumber}`, data),

  deleteTask: (slug: string, taskNumber: string) =>
    api.delete<void>(`/teams/${slug}/tasks/${taskNumber}`),

  // Comments
  getComments: (slug: string, taskNumber: number) =>
    api.get<ExtendedComment[]>(`/teams/${slug}/tasks/${taskNumber}/comments`),

  createComment: (slug: string, taskNumber: number, data: CreateCommentData) =>
    api.post<ExtendedComment>(
      `/teams/${slug}/tasks/${taskNumber}/comments`,
      data
    ),

  updateComment: (slug: string, taskNumber: number, data: UpdateCommentData) =>
    api.put<ExtendedComment>(
      `/teams/${slug}/tasks/${taskNumber}/comments`,
      data
    ),

  deleteComment: (slug: string, taskNumber: number, id: string) =>
    api.delete<void>(`/teams/${slug}/tasks/${taskNumber}/comments`, {
      data: { id },
    }),

  // Attachments
  getAttachments: (slug: string, taskNumber: number) =>
    api.get<Attachment[]>(`/teams/${slug}/tasks/${taskNumber}/attachments`),

  uploadAttachment: (
    slug: string,
    taskNumber: number,
    params: AttachmentUploadParams
  ) => {
    const formData = new FormData();
    formData.append('file', params.file);
    formData.append('slug', params.slug);
    formData.append('taskId', String(params.taskId));
    if (params.description) {
      formData.append('description', params.description);
    }
    if (params.versionId) {
      formData.append('versionId', params.versionId);
    }

    return api.post<{ url: string }>(
      `/teams/${slug}/tasks/${taskNumber}/attachments`,
      formData,
      { headers: { 'Content-Type': undefined } }
    );
  },

  deleteAttachment: (slug: string, taskNumber: number, id: string) =>
    api.delete<void>(`/teams/${slug}/tasks/${taskNumber}/attachments`, {
      params: { id },
    }),

  // Linked Documentation
  getLinkedDocumentation: (slug: string, taskNumber: number) =>
    api.get<TaskLinkedDocumentation[]>(`/teams/${slug}/tasks/${taskNumber}/documentation`),
};
