import { useMutation, useQuery } from '@tanstack/react-query';
import {
  tasksEndpoints,
  CreateTaskData,
  UpdateTaskData,
  CreateCommentData,
  UpdateCommentData,
  AttachmentUploadParams,
} from '@/lib/api/endpoints/tasks';
import { queryKeys } from '../queryKeys';
import { queryClient } from '.';
import { invalidateProductCountCaches } from './oscrat/invalidations';
import {
  TASK_CONFIGURATION_PROPERTY_KEYS,
  type TaskProperties,
} from '@oscrat/model';

// Team tasks
export function useGetTeamTasks(slug: string) {
  return useQuery({
    queryKey: queryKeys.teams.tasks.all(slug),
    queryFn: () => tasksEndpoints.getTeamTasks(slug),
  });
}

// `task.teamId` from the API is a Prisma UUID, but the version-detail cache
// is keyed by the team slug (see ProductContext). Always pass the slug
// explicitly so the invalidation matches the cached query.
function invalidateVersionOpenTasksCache(
  slug: string,
  task: { versionId?: string | null }
) {
  if (task.versionId) {
    queryClient.invalidateQueries({
      queryKey: queryKeys.oscrat.projects.versions.detail(
        slug,
        task.versionId
      ),
    });
  }
}

function invalidateConfigurationReportCache(
  slug: string,
  task: { versionId?: string | null; properties: unknown }
) {
  const properties = task.properties as TaskProperties | null;
  const ruleId = properties?.[TASK_CONFIGURATION_PROPERTY_KEYS.RULE_ID];
  if (ruleId && task.versionId) {
    queryClient.invalidateQueries({
      queryKey: queryKeys.oscrat.projects.versions.jobs.configurationScan.all(
        slug,
        task.versionId
      ),
    });
  }
}

export function useCreateTeamTask(slug: string) {
  return useMutation({
    mutationFn: (data: CreateTaskData) =>
      tasksEndpoints.createTeamTask(slug, data),
    onSuccess: (task) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.teams.tasks.all(slug),
      });
      invalidateVersionOpenTasksCache(slug, task);
      invalidateConfigurationReportCache(slug, task);
      invalidateProductCountCaches(slug, task.productId);
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
    onSuccess: (task) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.teams.tasks.detail(slug, taskNumber),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.teams.tasks.all(slug),
      });
      invalidateVersionOpenTasksCache(slug, task);
      invalidateConfigurationReportCache(slug, task);
      invalidateProductCountCaches(slug, task.productId);
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
      // Refresh every cached version and the product list/detail summaries
      // so the open-task counts stay in sync after a deletion.
      queryClient.invalidateQueries({
        predicate: (q) =>
          Array.isArray(q.queryKey) &&
          q.queryKey[2] === 'oscrat' &&
          q.queryKey[3] === 'versions',
      });
      invalidateProductCountCaches(slug);
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

// Linked Documentation
export function useGetTaskLinkedDocumentation(
  slug: string,
  taskNumber: string
) {
  return useQuery({
    queryKey: queryKeys.teams.tasks.documentation(slug, taskNumber),
    queryFn: () =>
      tasksEndpoints.getLinkedDocumentation(slug, Number(taskNumber)),
    enabled: !!slug && !!taskNumber,
  });
}
