import {
  TaskExtended,
  TaskProperties,
  ExtendedComment,
  Attachment,
} from '@/types';
import { api } from '@/lib/api/client';
import { Task } from '@oscrat/model';

export type CreateTaskData = {
  title: string;
  description?: string;
  assigneeId?: string;
  duedate?: Date;
  priority?: string;
  status?: string;
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
}

export const tasksEndpoints = {
  // Team tasks
  getTeamTasks: (slug: string) => api.get<Task[]>(`/teams/${slug}/tasks`),

  createTeamTask: (slug: string, data: CreateTaskData) =>
    api.post<Task>(`/teams/${slug}/tasks`, data),

  // Single task
  getTask: (slug: string, taskNumber: string) =>
    api.get<TaskExtended>(`/teams/${slug}/tasks/${taskNumber}`),

  updateTask: (slug: string, taskNumber: string, data: UpdateTaskData) =>
    api.put<Task>(`/teams/${slug}/tasks/${taskNumber}`, data),

  deleteTask: (slug: string, taskNumber: string) =>
    api.delete<void>(`/teams/${slug}/tasks/${taskNumber}`),

  updateTaskProperties: (
    slug: string,
    taskNumber: number,
    properties: Partial<TaskProperties>
  ) =>
    api.put<TaskProperties>(
      `/teams/${slug}/tasks/${taskNumber}/properties`,
      properties
    ),

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

    return api.post<{ url: string }>(
      `/teams/${slug}/tasks/${taskNumber}/attachments`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );
  },

  deleteAttachment: (slug: string, taskNumber: number, id: string) =>
    api.delete<void>(`/teams/${slug}/tasks/${taskNumber}/attachments`, {
      params: { id },
    }),
};
