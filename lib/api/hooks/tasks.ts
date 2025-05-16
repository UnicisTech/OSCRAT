import { useMutation, useQuery } from '@tanstack/react-query';
import {
  tasksEndpoints,
  CreateTaskData,
  UpdateTaskData,
  CreateCommentData,
  UpdateCommentData,
  AttachmentUploadParams,
} from '@/lib/api/endpoints/tasks';
import { TaskProperties } from '@/types';
import { queryKeys } from '../queryKeys';
import { queryClient } from '.';

// Team tasks
export function useGetTeamTasks(slug: string) {
  return useQuery({
    queryKey: queryKeys.teams.tasks.all(slug),
    queryFn: () => tasksEndpoints.getTeamTasks(slug),
  });
}

export function useCreateTeamTask(slug: string) {
  return useMutation({
    mutationFn: (data: CreateTaskData) =>
      tasksEndpoints.createTeamTask(slug, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.teams.tasks.all(slug),
      });
    },
  });
}

// Single task
export function useGetTask(slug: string, taskNumber: string) {
  return useQuery({
    queryKey: queryKeys.teams.tasks.detail(slug, taskNumber),
    queryFn: () => tasksEndpoints.getTask(slug, taskNumber),
  });
}

export function useUpdateTask(slug: string, taskNumber: string) {
  return useMutation({
    mutationFn: (data: UpdateTaskData) => {
      return tasksEndpoints.updateTask(slug, taskNumber, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.teams.tasks.detail(slug, taskNumber),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.teams.tasks.all(slug),
      });
    },
  });
}

export function useDeleteTask(slug: string, taskNumber: string) {
  return useMutation({
    mutationFn: () => tasksEndpoints.deleteTask(slug, taskNumber),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.teams.tasks.detail(slug, taskNumber),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.teams.tasks.all(slug),
      });
    },
  });
}

// Task properties
export function useUpdateTaskProperties(slug: string, taskNumber: number) {
  return useMutation({
    mutationFn: (properties: Partial<TaskProperties>) =>
      tasksEndpoints.updateTaskProperties(slug, taskNumber, properties),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.teams.tasks.detail(slug, taskNumber.toString()),
      });
    },
  });
}

// Comments
export function useGetTaskComments(slug: string, taskNumber: string) {
  return useQuery({
    queryKey: queryKeys.teams.tasks.comments(slug, taskNumber),
    queryFn: () => tasksEndpoints.getComments(slug, Number(taskNumber)),
  });
}

export function useCreateTaskComment(slug: string, taskNumber: string) {
  return useMutation({
    mutationFn: (data: CreateCommentData) =>
      tasksEndpoints.createComment(slug, Number(taskNumber), data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.teams.tasks.comments(slug, taskNumber),
      });
    },
  });
}

export function useUpdateTaskComment(slug: string, taskNumber: string) {
  return useMutation({
    mutationFn: (data: UpdateCommentData) =>
      tasksEndpoints.updateComment(slug, Number(taskNumber), data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.teams.tasks.comments(slug, taskNumber),
      });
    },
  });
}

export function useDeleteTaskComment(slug: string, taskNumber: string) {
  return useMutation({
    mutationFn: (id: string) =>
      tasksEndpoints.deleteComment(slug, Number(taskNumber), id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.teams.tasks.comments(slug, taskNumber),
      });
    },
  });
}

// Attachments
export function useGetTaskAttachments(slug: string, taskNumber: string) {
  return useQuery({
    queryKey: queryKeys.teams.tasks.attachments(slug, taskNumber),
    queryFn: () => tasksEndpoints.getAttachments(slug, Number(taskNumber)),
  });
}

/**
 * Hook for uploading task attachments
 * @param slug Team slug
 * @param taskNumber Task number
 */
export function useUploadTaskAttachment(slug: string, taskNumber: string) {
  return useMutation({
    mutationFn: (params: AttachmentUploadParams) =>
      tasksEndpoints.uploadAttachment(slug, Number(taskNumber), params),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.teams.tasks.detail(slug, taskNumber),
      });
    },
  });
}

/**
 * Hook for deleting task attachments
 * @param slug Team slug
 * @param taskNumber Task number
 */
export function useDeleteTaskAttachment(slug: string, taskNumber: string) {
  return useMutation({
    mutationFn: (id: string) =>
      tasksEndpoints.deleteAttachment(slug, Number(taskNumber), id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.teams.tasks.detail(slug, taskNumber),
      });
    },
  });
}
